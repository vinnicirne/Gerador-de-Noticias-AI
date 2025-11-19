
import { supabase } from './supabase';
import type { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // 1. Autenticação no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Usuário não encontrado.');

    // 2. Buscar dados complementares na tabela 'usuarios'
    const { data: profileData, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
        console.error("Erro ao buscar perfil na tabela 'usuarios':", profileError);
        // Se o erro for de conexão ou tabela inexistente, lançamos. 
        // Se for apenas registro não encontrado (PGRST116), podemos tentar prosseguir ou barrar.
        // Para integridade, é melhor barrar ou criar um perfil default.
        if (profileError.code !== 'PGRST116') {
           // throw new Error('Erro de sistema: Não foi possível carregar seu perfil.');
        }
    }

    // Normalização de Role: Aceita 'super_admin' ou 'admin' no banco como admin na app
    const dbRole = profileData?.role || 'user';
    const appRole = (dbRole === 'super_admin' || dbRole === 'admin') ? 'admin' : 'user';

    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      name: profileData?.name || authData.user.user_metadata?.name || email.split('@')[0],
      role: appRole as 'user' | 'admin',
      plan: profileData?.plan || 'Gratuito',
      credits: profileData?.creditos_saldo ?? 0, 
      status: 'Active'
    };

    return user;
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Falha ao criar usuário no sistema de autenticação.');

    // 2. Inserir na tabela pública 'usuarios'
    const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{
            id: authData.user.id,
            email: email,
            name: name,
            role: 'standard',
            creditos_saldo: 3,
            plan: 'Gratuito'
        }]);

    if (insertError) {
        console.warn("Aviso: Falha ao criar registro na tabela pública 'usuarios'. Verifique triggers ou permissões.", insertError.message);
    }

    const newUser: User = {
      id: authData.user.id,
      name,
      email,
      role: 'user',
      plan: 'Gratuito',
      credits: 3,
      status: 'Active'
    };

    return newUser;
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentSession: async (): Promise<User | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) return null;

    const { data: profileData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const dbRole = profileData?.role || 'user';
    const appRole = (dbRole === 'super_admin' || dbRole === 'admin') ? 'admin' : 'user';

    return {
      id: session.user.id,
      email: session.user.email!,
      name: profileData?.name || session.user.user_metadata?.name || 'Usuário',
      role: appRole as 'user' | 'admin',
      plan: profileData?.plan || 'Gratuito',
      credits: profileData?.creditos_saldo ?? 0,
      status: 'Active'
    };
  }
};
