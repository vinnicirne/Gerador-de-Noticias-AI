
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

// Fallback para evitar crash se as variáveis não estiverem definidas (comum na primeira execução)
// O App não funcionará corretamente sem as chaves reais, mas carregará a UI para mostrar os erros.
const supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
