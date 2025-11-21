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

const initializeSupabase = () => {
    if (!url || !key) {
        console.warn("⚠️ Supabase não configurado. O app rodará em modo limitado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar autenticação e banco de dados.");
        return null;
    }

    return createClient(url, key, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    });
};

export const supabase = initializeSupabase();

export const isSupabaseConfigured = () => {
    return supabase !== null;
};