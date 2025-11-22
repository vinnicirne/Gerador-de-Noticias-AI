// FIX: Import missing types
import { PaymentConfig, PaymentTransaction, CreditPackage, PaymentPlatform, MercadoPagoPreference, MercadoPagoResponse } from '../types';
import { creditService } from './creditService';
import { notificationService } from './notificationService';
import { userService } from './userService';
// FIX: Import CREDIT_PACKAGES for fallback
import { CREDIT_PACKAGES } from '../constants';

const CONFIG_STORAGE_KEY = 'gdn_payment_config';
const PACKAGES_STORAGE_KEY = 'gdn_credit_packages';

class PaymentService {
    private configs: PaymentConfig[];
    private creditPackages: CreditPackage[];

    constructor() {
        const storedConfigs = localStorage.getItem(CONFIG_STORAGE_KEY);
        this.configs = storedConfigs ? JSON.parse(storedConfigs) : [
            { platform: 'mercadopago', isActive: true, publicKey: '', accessToken: '' },
            { platform: 'stripe', isActive: false, publicKey: '', accessToken: '' },
        ];

        const storedPackages = localStorage.getItem(PACKAGES_STORAGE_KEY);
        this.creditPackages = storedPackages ? JSON.parse(storedPackages) : CREDIT_PACKAGES;
    }

    // --- CONFIGS MANAGEMENT ---
    public getConfigs(): PaymentConfig[] {
        return this.configs;
    }

    public saveConfigs(configs: PaymentConfig[]): void {
        this.configs = configs;
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.configs));
        notificationService.notify('Configurações de pagamento salvas.', 'success');
    }

    // --- PACKAGES MANAGEMENT ---
    public getCreditPackages(): CreditPackage[] {
        return [...this.creditPackages].sort((a, b) => a.order - b.order);
    }

    public saveCreditPackages(packages: CreditPackage[]): void {
        this.creditPackages = packages;
        localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(this.creditPackages));
        notificationService.notify('Pacotes de crédito atualizados.', 'success');
    }
    
    // --- CHECKOUT LOGIC ---
    public getActivePlatform(): PaymentPlatform | null {
        const active = this.configs.find(c => c.isActive);
        return active ? active.platform : null;
    }

    /**
     * Simulação da classe MercadoPagoService do Python
     */
    public async createMercadoPagoPreference(pkg: CreditPackage, transactionId: string): Promise<MercadoPagoResponse> {
        const user = userService.getUser();
        
        const preferenceData: MercadoPagoPreference = {
            items: [ { title: `${pkg.credits} Créditos - GDN_IA`, quantity: 1, currency_id: 'BRL', unit_price: pkg.price } ],
            payer: { email: user.email },
            back_urls: { success: "https://seusite.com/success", failure: "https://seusite.com/failure", pending: "https://seusite.com/pending" },
            auto_return: "approved",
            external_reference: transactionId,
            notification_url: "https://seusite.com/webhook/mercadopago"
        };

        console.log('[MercadoPago SDK] Creating Preference:', preferenceData);
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            id: `pref_${Math.random().toString(36).substr(2, 9)}`,
            init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${transactionId}`,
            sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${transactionId}`
        };
    }

    /**
     * Cria uma intenção de pagamento e chama o "SDK" apropriado.
     */
    public async createPaymentIntent(pkg: CreditPackage, method: 'pix' | 'credit_card'): Promise<PaymentTransaction> {
        const platform = this.getActivePlatform();
        if (!platform) throw new Error('Nenhum gateway de pagamento ativo.');

        const transactionId = `${platform === 'mercadopago' ? 'mp' : 'st'}_${Math.random().toString(36).substr(2, 9)}`;
        const user = userService.getUser();

        const transaction: PaymentTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            paymentId: transactionId,
            user: user.id,
            packageId: pkg.id,
            amount: pkg.price,
            credits: pkg.credits,
            status: 'pending',
            method: method,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (platform === 'mercadopago') {
            try {
                const mpResponse = await this.createMercadoPagoPreference(pkg, transactionId);
                transaction.preferenceId = mpResponse.id;
                transaction.initPoint = mpResponse.init_point;
            } catch (e) {
                console.error("MP Error", e);
                throw new Error("Falha ao criar preferência no Mercado Pago.");
            }
        }

        console.log(`[Payment] Intent created: ${transactionId} via ${platform}`);
        return transaction;
    }

    /**
     * Simula o webhook ou polling de status do pagamento.
     */
    public async getPaymentStatus(transaction: PaymentTransaction): Promise<PaymentTransaction> {
        console.log(`[Payment] Checking status for ${transaction.paymentId}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const success = Math.random() > 0.1;
        if (success) {
            transaction.status = 'approved';
            transaction.updatedAt = new Date().toISOString();
            creditService.addCredits(transaction.credits, `Compra Pacote ${transaction.packageId.toUpperCase()} (${transaction.method.toUpperCase()})`);
            return transaction;
        } else {
            transaction.status = 'rejected';
            transaction.updatedAt = new Date().toISOString();
            throw new Error('Pagamento rejeitado ou pendente.');
        }
    }
}

export const paymentService = new PaymentService();