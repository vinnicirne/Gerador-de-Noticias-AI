
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, viteKey: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        return (import.meta as any).env[viteKey] || (import.meta as any).env[key];
    }
    return '';
};

// Obtém as variáveis de ambiente
const url = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const key = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
    return !!url && !!key;
};

// Se não houver URL configurada, usamos um valor fictício para satisfazer a validação
// da biblioteca 'createClient' e evitar o erro "supabaseUrl is required".
// O app carregará, mas operações que dependem do Supabase falharão se não houver config real.
const supabaseUrl = url || 'https://placeholder.supabase.co';
const supabaseKey = key || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false // Evita erros de redirect em alguns ambientes
    }
});
