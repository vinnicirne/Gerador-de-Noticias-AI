// Arquivo: backend/geminiService.js (Esta lógica DEVE RODAR APENAS NO BACKEND DA VERCEL)

import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js'; 

// --- Configuração de Chaves (Apenas Backend) ---
// Estas variáveis são lidas do ambiente do servidor Vercel (SEM PREFIXO VITE_ no Backend)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; 

// Cliente de Servidor (SERVICE_ROLE) para Débito de Crédito e Leitura Segura
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Função principal de Geração e Débito
export const generateNewsArticle = async (userId: string, theme: string, topic: string, tone: string): Promise<any> => {
  
  if (!SUPABASE_SERVICE_KEY) {
      throw new Error("Erro de Servidor: Chave de Administração do Supabase ausente.");
  }
  
  // 1. VERIFICAÇÃO DE SALDO (Segurança)
  const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('usuarios')
      .select('creditos_saldo')
      .eq('id', userId)
      .single();

  if (profileError) throw new Error("Erro ao buscar perfil do usuário no servidor.");

  // LÓGICA DE PAYWALL: Retorna erro se créditos <= 0
  if (userProfile.creditos_saldo <= 0) {
      // Retorna uma mensagem de erro que seu Frontend deve interpretar como 402/Paywall
      throw new Error("Saldo insuficiente. Por favor, recarregue seus créditos."); 
  }

  // --- Código de Chamada GEMINI (Omitido para brevidade, mas deve ser inserido aqui) ---
  // A chamada ao Gemini deve ocorrer aqui, retornando parsedContent (finalNews)
  const finalNews = { /* ... Resultado do JSON da IA ... */ }; 

  // 2. DÉBITO E HISTÓRICO (Atomicidade)
  const newBalance = userProfile.creditos_saldo - 1;
  
  // 2a. Débito
  const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({ creditos_saldo: newBalance })
      .eq('id', userId);

  if (updateError) {
      console.error("Erro ao debitar crédito:", updateError);
      throw new Error("Erro ao finalizar transação de crédito. Tente novamente.");
  }

  // 2b. Histórico
  await supabaseAdmin
      .from('historico_prompts')
      .insert([{
          user_id: userId,
          prompt_text: `${theme} - ${topic} (${tone})`,
          response_json: finalNews, // Salva o resultado final no histórico
          timestamp: new Date().toISOString()
      }]);
  
  // Retorna a notícia
  return finalNews;
};