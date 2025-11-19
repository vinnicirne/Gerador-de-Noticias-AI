// Arquivo: src/services/supabaseClient.ts (Substitui supabase.ts e supabase2.ts)

import { createClient } from '@supabase/supabase-js';

// --- Função para obter variáveis (Simplificada e segura para Frontend) ---
// O Vite expõe VITE_... no objeto import.meta.env
const getFrontendEnvVar = (key: string): string => {
    // Tenta ler VITE_... (padrão Vite)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        return (import.meta as any).env[key] || '';
    }
    return '';
};

const supabaseUrl = getFrontendEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getFrontendEnvVar('VITE_SUPABASE_ANON_KEY');

// Verifica se as chaves necessárias para o FRONTEND existem.
export const isSupabaseConfigured = (): boolean => {
    return !!supabaseUrl && !!supabaseAnonKey;
};

// Se não configurado, usamos valores inválidos para que o createClient não quebre, mas isSupabaseConfigured() retorne false.
const finalUrl = supabaseUrl || 'https://supabase-not-configured.invalid';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey, {
    auth: {
        // Mantém a sessão ativa
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase não configurado. Funções de Auth estão desativadas.");
}