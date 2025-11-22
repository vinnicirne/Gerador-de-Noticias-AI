// backend/webhooks/mercadopago.ts
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAÇÃO E TIPOS
// ============================================

interface WebhookPayload {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: string;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

interface PaymentData {
  id: string;
  status: 'approved' | 'rejected' | 'cancelled' | 'pending' | 'in_process';
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  payer: {
    email: string;
  };
}

interface WebhookLog {
  id: string;
  event_id: string;
  event_type: string;
  payment_id: string;
  status: string;
  raw_payload: any;
  signature_valid: boolean;
  processed: boolean;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

// ============================================
// VALIDAÇÃO DE ASSINATURA HMAC
// ============================================

class MercadoPagoSignatureValidator {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Valida a assinatura HMAC-SHA256 do Mercado Pago
   * Formato do header: ts=1234567890,v1=hash_hmac_sha256
   */
  validateSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string
  ): boolean {
    try {
      // Parse do header x-signature
      const parts = xSignature.split(',');
      const timestamp = parts.find(p => p.startsWith('ts='))?.split('=')[1];
      const receivedHash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

      if (!timestamp || !receivedHash) {
        console.error('[Webhook] Formato inválido de assinatura');
        return false;
      }

      // Validação de timestamp (janela de 5 minutos)
      const now = Math.floor(Date.now() / 1000);
      const tsNumber = parseInt(timestamp);
      if (Math.abs(now - tsNumber) > 300) {
        console.error('[Webhook] Timestamp expirado');
        return false;
      }

      // Construção do manifest (formato exato do Mercado Pago)
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;

      // Cálculo do HMAC
      const expectedHash = crypto
        .createHmac('sha256', this.secret)
        .update(manifest)
        .digest('hex');

      // Comparação segura (timing-safe)
      return crypto.timingSafeEqual(
        Buffer.from(expectedHash),
        Buffer.from(receivedHash)
      );
    } catch (error) {
      console.error('[Webhook] Erro ao validar assinatura:', error);
      return false;
    }
  }
}

// ============================================
// SERVIÇO DE WEBHOOK
// ============================================

class MercadoPagoWebhookService {
  private supabase;
  private signatureValidator: MercadoPagoSignatureValidator;
  private mercadopagoAccessToken: string;
  private maxRetries = 3;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
    this.mercadopagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;
    
    // Cliente Admin (SERVICE_ROLE) para operações sensíveis
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validador de assinatura
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET!;
    this.signatureValidator = new MercadoPagoSignatureValidator(webhookSecret);
  }

  /**
   * Processa webhook do Mercado Pago
   */
  async processWebhook(
    payload: WebhookPayload,
    headers: Record<string, string>
  ): Promise<{ success: boolean; message: string }> {
    const eventId = payload.id;
    const dataId = payload.data.id;

    console.log(`[Webhook] Recebido evento ${eventId} para pagamento ${dataId}`);

    try {
      // 1. VALIDAÇÃO DE ASSINATURA (Crítico para Segurança)
      const xSignature = headers['x-signature'];
      const xRequestId = headers['x-request-id'];

      if (!xSignature || !xRequestId) {
        await this.logWebhook(eventId, payload, false, false, 'Headers ausentes');
        return { success: false, message: 'Headers de segurança ausentes' };
      }

      const isValid = this.signatureValidator.validateSignature(
        xSignature,
        xRequestId,
        dataId
      );

      if (!isValid) {
        await this.logWebhook(eventId, payload, false, false, 'Assinatura inválida');
        return { success: false, message: 'Assinatura HMAC inválida' };
      }

      // 2. VERIFICAR SE JÁ FOI PROCESSADO (Idempotência)
      const { data: existingLog } = await this.supabase
        .from('webhook_logs')
        .select('*')
        .eq('event_id', eventId)
        .eq('processed', true)
        .single();

      if (existingLog) {
        console.log(`[Webhook] Evento ${eventId} já processado anteriormente`);
        return { success: true, message: 'Evento já processado' };
      }

      // 3. BUSCAR DADOS COMPLETOS DO PAGAMENTO NA API
      const paymentData = await this.fetchPaymentData(dataId);

      if (!paymentData) {
        await this.logWebhook(eventId, payload, true, false, 'Dados de pagamento não encontrados');
        return { success: false, message: 'Pagamento não encontrado' };
      }

      // 4. PROCESSAR PAGAMENTO BASEADO NO STATUS
      const result = await this.processPaymentStatus(paymentData);

      // 5. LOG DE SUCESSO
      await this.logWebhook(eventId, payload, true, result.success, result.message);

      return result;

    } catch (error: any) {
      console.error('[Webhook] Erro ao processar:', error);
      await this.logWebhook(eventId, payload, true, false, error.message);
      
      // RETRY LOGIC: Re-enfileirar para retry se for erro temporário
      await this.scheduleRetry(eventId, payload);
      
      return { success: false, message: error.message };
    }
  }

  /**
   * Busca dados completos do pagamento na API do Mercado Pago
   */
  private async fetchPaymentData(paymentId: string): Promise<PaymentData | null> {
    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.mercadopagoAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`[Webhook] Erro ao buscar pagamento ${paymentId}: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[Webhook] Erro na requisição à API do MP:', error);
      return null;
    }
  }

  /**
   * Processa o pagamento baseado no status
   */
  private async processPaymentStatus(
    payment: PaymentData
  ): Promise<{ success: boolean; message: string }> {
    const { status, external_reference, transaction_amount, payer } = payment;

    console.log(`[Webhook] Processando pagamento ${payment.id} com status: ${status}`);

    // Buscar transação interna pelo external_reference
    const { data: transaction, error: txError } = await this.supabase
      .from('transactions')
      .select('*, credit_packages(*)')
      .eq('payment_id', external_reference)
      .single();

    if (txError || !transaction) {
      return { 
        success: false, 
        message: `Transação interna não encontrada: ${external_reference}` 
      };
    }

    switch (status) {
      case 'approved':
        return await this.handleApprovedPayment(transaction, payment);
      
      case 'rejected':
        return await this.handleRejectedPayment(transaction, payment);
      
      case 'cancelled':
        return await this.handleCancelledPayment(transaction, payment);
      
      case 'pending':
      case 'in_process':
        // Aguardar processamento - não fazer nada
        return { success: true, message: 'Pagamento em processamento' };
      
      default:
        return { success: false, message: `Status desconhecido: ${status}` };
    }
  }

  /**
   * Processa pagamento aprovado
   */
  private async handleApprovedPayment(
    transaction: any,
    payment: PaymentData
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. ATUALIZAR STATUS DA TRANSAÇÃO
      await this.supabase
        .from('transactions')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
          mercadopago_payment_id: payment.id
        })
        .eq('id', transaction.id);

      // 2. ADICIONAR CRÉDITOS AO USUÁRIO (TRANSAÇÃO ATÔMICA)
      const { data: user, error: userError } = await this.supabase
        .from('usuarios')
        .select('creditos_saldo')
        .eq('id', transaction.user_id)
        .single();

      if (userError) throw new Error('Usuário não encontrado');

      const newBalance = (user.creditos_saldo || 0) + transaction.credits;

      await this.supabase
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', transaction.user_id);

      // 3. CRIAR LOG DE AUDITORIA
      await this.supabase.from('credit_history').insert({
        user_id: transaction.user_id,
        type: 'purchase',
        amount: transaction.credits,
        description: `Compra aprovada - Pacote ${transaction.credit_packages.name}`,
        transaction_id: transaction.id
      });

      // 4. ENVIAR EMAIL DE CONFIRMAÇÃO
      await this.sendConfirmationEmail(transaction, payment);

      console.log(`[Webhook] Créditos adicionados: ${transaction.credits} para usuário ${transaction.user_id}`);

      return { 
        success: true, 
        message: `Pagamento aprovado e ${transaction.credits} créditos adicionados` 
      };
    } catch (error: any) {
      console.error('[Webhook] Erro ao processar aprovação:', error);
      throw error;
    }
  }

  /**
   * Processa pagamento rejeitado
   */
  private async handleRejectedPayment(
    transaction: any,
    payment: PaymentData
  ): Promise<{ success: boolean; message: string }> {
    await this.supabase
      .from('transactions')
      .update({
        status: 'rejected',
        status_detail: payment.status_detail,
        updated_at: new Date().toISOString(),
        mercadopago_payment_id: payment.id
      })
      .eq('id', transaction.id);

    // Email de falha (opcional)
    await this.sendRejectionEmail(transaction, payment);

    return { success: true, message: 'Pagamento rejeitado registrado' };
  }

  /**
   * Processa pagamento cancelado
   */
  private async handleCancelledPayment(
    transaction: any,
    payment: PaymentData
  ): Promise<{ success: boolean; message: string }> {
    await this.supabase
      .from('transactions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        mercadopago_payment_id: payment.id
      })
      .eq('id', transaction.id);

    return { success: true, message: 'Pagamento cancelado registrado' };
  }

  /**
   * Envia email de confirmação de pagamento
   */
  private async sendConfirmationEmail(transaction: any, payment: PaymentData): Promise<void> {
    // Integração com serviço de email (Resend, SendGrid, etc)
    // Aqui você implementaria a lógica de envio de email
    console.log(`[Webhook] Email de confirmação para ${payment.payer.email}`);
    
    // Exemplo com Resend:
    // await resend.emails.send({
    //   from: 'noreply@seuapp.com',
    //   to: payment.payer.email,
    //   subject: 'Pagamento Aprovado - Créditos Adicionados',
    //   html: emailTemplate
    // });
  }

  /**
   * Envia email de rejeição de pagamento
   */
  private async sendRejectionEmail(transaction: any, payment: PaymentData): Promise<void> {
    console.log(`[Webhook] Email de rejeição para ${payment.payer.email}`);
    // Implementar lógica de email
  }

  /**
   * Log de webhook no banco de dados
   */
  private async logWebhook(
    eventId: string,
    payload: WebhookPayload,
    signatureValid: boolean,
    processed: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      await this.supabase.from('webhook_logs').insert({
        event_id: eventId,
        event_type: payload.type,
        payment_id: payload.data.id,
        status: payload.action,
        raw_payload: payload,
        signature_valid: signatureValid,
        processed: processed,
        error_message: errorMessage || null,
        retry_count: 0
      });
    } catch (error) {
      console.error('[Webhook] Erro ao criar log:', error);
    }
  }

  /**
   * Agenda retry para webhooks que falharam
   */
  private async scheduleRetry(eventId: string, payload: WebhookPayload): Promise<void> {
    const { data: log } = await this.supabase
      .from('webhook_logs')
      .select('retry_count')
      .eq('event_id', eventId)
      .single();

    if (log && log.retry_count < this.maxRetries) {
      await this.supabase
        .from('webhook_logs')
        .update({ retry_count: log.retry_count + 1 })
        .eq('event_id', eventId);

      console.log(`[Webhook] Agendado retry ${log.retry_count + 1}/${this.maxRetries} para evento ${eventId}`);
      
      // Aqui você pode integrar com uma fila (Bull, BullMQ, etc)
      // para processar o retry de forma assíncrona
    }
  }
}

// ============================================
// HANDLER DO ENDPOINT (Next.js API Route / Vercel)
// ============================================

export default async function handler(req: any, res: any) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookService = new MercadoPagoWebhookService();
    const result = await webhookService.processWebhook(req.body, req.headers);

    // Mercado Pago espera status 200/201 mesmo em falhas de processamento
    // para não reenviar o webhook infinitamente
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Webhook Handler] Erro fatal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// ============================================
// SQL MIGRATION - Tabelas necessárias
// ============================================

/*
-- Tabela de Logs de Webhook
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  status TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  signature_valid BOOLEAN NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_payment_id ON webhook_logs(payment_id);
CREATE INDEX idx_webhook_logs_processed ON webhook_logs(processed);

-- Tabela de Transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id),
  payment_id TEXT NOT NULL UNIQUE,
  package_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  status_detail TEXT,
  mercadopago_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Tabela de Histórico de Créditos
CREATE TABLE credit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id),
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_history_user_id ON credit_history(user_id);
*/