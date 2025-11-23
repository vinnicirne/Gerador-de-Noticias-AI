/**************************************************************************************************
 *                                                                                                *
 *   !!! ATENÇÃO: ERRO DE TABELA NÃO ENCONTRADA? EXECUTE O SCRIPT SQL ABAIXO PRIMEIRO !!!          *
 *                                                                                                *
 *   Este arquivo contém o script SQL necessário para configurar o banco de dados.              *
 *   Se você está vendo erros como "Could not find the table 'public.profiles'", é porque        *
 *   este script ainda não foi executado.                                                         *
 *                                                                                                *
 *   COMO EXECUTAR:                                                                               *
 *   1. Acesse seu projeto no painel do Supabase (app.supabase.com).                              *
 *   2. No menu esquerdo, vá para "SQL Editor".                                                   *
 *   3. Clique em "+ New query".                                                                  *
 *   4. Copie TODO o conteúdo do bloco de comentário abaixo (da linha que começa com              *
 *      `/* -- SEÇÃO 0:` até o final do comentário `*/`).                                         *
 *   5. Cole no editor SQL e clique em "RUN".                                                     *
 *                                                                                                *
 **************************************************************************************************/

/*
  ================================================================================================
  ==           SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS - GDN_IA v4 (View-Based)             ==
  ================================================================================================
  
  Este script prepara o banco de dados Supabase com uma arquitetura robusta, utilizando uma
  tabela 'profiles' para dados de usuário e uma view 'users' para leitura combinada com
  os dados de autenticação. Esta é uma prática recomendada para evitar conflitos e
  organizar melhor os dados.
  
  Execute este script UMA VEZ no Editor SQL do seu projeto Supabase.
  Acesse: Database -> SQL Editor -> New query.
  
  ================================================================================================
*/

/*
-- SEÇÃO 0: LIMPEZA E PREPARAÇÃO
-- Remove a view 'users' e a tabela 'profiles' antigas para garantir uma instalação limpa.
DROP VIEW IF EXISTS public.users;
DROP TABLE IF EXISTS public.profiles;

-- SEÇÃO 1: TIPOS DE DADOS PERSONALIZADOS (ENUMs)
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('user', 'editor', 'admin', 'super_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'banned'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.news_type AS ENUM ('current', 'predictive'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.news_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.payment_method AS ENUM ('pix', 'card'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.transaction_status AS ENUM ('pending', 'approved', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.ai_platform AS ENUM ('gemini', 'openai', 'claude'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- SEÇÃO 2: CRIAÇÃO DAS TABELAS
-- Tabela de perfis para armazenar dados adicionais do usuário.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    "role" public.user_role NOT NULL DEFAULT 'user',
    status public.user_status NOT NULL DEFAULT 'active',
    credits integer NOT NULL DEFAULT 0,
    plan text,
    created_at timestamptz DEFAULT now()
);

-- Demais tabelas agora referenciam 'profiles'
CREATE TABLE IF NOT EXISTS public.news (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    titulo text NOT NULL,
    conteudo text NOT NULL,
    sources jsonb,
    tipo public.news_type NOT NULL,
    status public.news_status NOT NULL DEFAULT 'pending',
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.logs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    acao text NOT NULL,
    modulo text,
    detalhes jsonb,
    "data" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    valor numeric(10, 2) NOT NULL,
    metodo public.payment_method NOT NULL,
    status public.transaction_status NOT NULL DEFAULT 'pending',
    "data" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pacotes_credito (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    quantidade integer NOT NULL,
    preco numeric(10, 2) NOT NULL,
    ativo boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.settings (
    chave text PRIMARY KEY,
    valor jsonb,
    categoria text
);
INSERT INTO public.settings (chave, valor, categoria)
VALUES ('multi_ai_platforms', '{"gemini": {"enabled": true, "apiKey": "", "costPerMillionTokens": 0.50, "maxTokens": 8192}, "openai": {"enabled": false, "apiKey": "", "costPerMillionTokens": 1.00, "maxTokens": 4096}, "claude": {"enabled": false, "apiKey": "", "costPerMillionTokens": 1.50, "maxTokens": 100000}}'::jsonb, 'multi_ia')
ON CONFLICT (chave) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.modelos_ia (
    id text PRIMARY KEY,
    nome text NOT NULL,
    plataforma public.ai_platform NOT NULL,
    contexto_maximo integer,
    capacidades jsonb,
    status text NOT NULL DEFAULT 'inactive',
    custo_token numeric(10, 4)
);

CREATE TABLE IF NOT EXISTS public.consumo_ia (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    modelo_id text NOT NULL REFERENCES public.modelos_ia(id),
    tokens integer NOT NULL,
    custo numeric(10, 6) NOT NULL,
    "data" timestamptz NOT NULL DEFAULT now()
);

-- SEÇÃO 3: CRIAÇÃO DA VIEW 'users'
-- Esta view combina auth.users e public.profiles para ser a fonte de leitura de dados do usuário.
CREATE OR REPLACE VIEW public.users AS
SELECT
    u.id,
    u.email,
    p.full_name,
    p.role,
    p.status,
    p.credits,
    p.plan
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- SEÇÃO 4: POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- A função is_admin agora lê da tabela 'profiles'.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (SELECT "role" FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilita RLS em todas as tabelas relevantes.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacotes_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumo_ia ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela 'profiles'
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;
CREATE POLICY "Allow admin full access" ON public.profiles FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Allow user to read own profile" ON public.profiles;
CREATE POLICY "Allow user to read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());

-- Políticas para as outras tabelas (sem grandes mudanças, pois usam is_admin() ou auth.uid())
DROP POLICY IF EXISTS "Allow admin full access on news" ON public.news;
CREATE POLICY "Allow admin full access on news" ON public.news FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Allow authenticated users to create news" ON public.news;
CREATE POLICY "Allow authenticated users to create news" ON public.news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow author to see their own news" ON public.news;
CREATE POLICY "Allow author to see their own news" ON public.news FOR SELECT USING (autor_id = auth.uid());
DROP POLICY IF EXISTS "Allow admin full access" ON public.logs;
CREATE POLICY "Allow admin full access" ON public.logs FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Allow admin full access" ON public.transactions;
CREATE POLICY "Allow admin full access" ON public.transactions FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Allow admin full access" ON public.settings;
CREATE POLICY "Allow admin full access" ON public.settings FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Allow admin full access" ON public.modelos_ia;
CREATE POLICY "Allow admin full access" ON public.modelos_ia FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Allow admin full access" ON public.consumo_ia;
CREATE POLICY "Allow admin full access" ON public.consumo_ia FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Allow authenticated read access to packages" ON public.pacotes_credito;
CREATE POLICY "Allow authenticated read access to packages" ON public.pacotes_credito FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow admin full access on packages" ON public.pacotes_credito;
CREATE POLICY "Allow admin full access on packages" ON public.pacotes_credito FOR ALL USING (is_admin());

-- SEÇÃO 5: FUNÇÕES (Remote Procedure Calls - RPC)
-- create_new_user agora insere em 'profiles' e retorna o usuário da view 'users'.
CREATE OR REPLACE FUNCTION public.create_new_user(
    p_email text, p_password text, p_full_name text, p_role text, p_credits integer, p_status text, p_plan text DEFAULT NULL
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  auth_user_id uuid;
  new_user_profile json;
BEGIN
  -- Cria o usuário em auth.users. Se já existir, apenas recupera o ID.
  SELECT id INTO auth_user_id FROM auth.users WHERE email = p_email;
  IF auth_user_id IS NULL THEN
    auth_user_id := (auth.admin_create_user(p_email, p_password, '{"email_confirm": false}'::jsonb)).id;
  END IF;

  -- Insere ou atualiza o perfil em public.profiles
  INSERT INTO public.profiles (id, full_name, "role", status, credits, plan)
  VALUES (auth_user_id, p_full_name, p_role::public.user_role, p_status::public.user_status, p_credits, p_plan)
  ON CONFLICT (id) DO UPDATE SET full_name = excluded.full_name, "role" = excluded.role, status = excluded.status, credits = excluded.credits, plan = excluded.plan;

  -- Retorna o usuário completo da view 'users' como JSON.
  SELECT to_json(u) INTO new_user_profile FROM public.users u WHERE u.id = auth_user_id;
  RETURN new_user_profile;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_users_7d()
RETURNS integer LANGUAGE sql SECURITY DEFINER AS $$
  SELECT count(DISTINCT user_id) FROM auth.sessions WHERE created_at >= now() - interval '7 days';
$$;

-- get_daily_platform_usage agora lê da tabela 'profiles' para novos usuários.
CREATE OR REPLACE FUNCTION public.get_daily_platform_usage()
RETURNS TABLE(report_date text, news_count bigint, new_users_count bigint) LANGUAGE sql SECURITY DEFINER AS $$
  WITH date_series AS (
    SELECT generate_series((now() - interval '6 days')::date, now()::date, '1 day'::interval)::date AS report_date
  )
  SELECT ds.report_date::text, coalesce(n.count, 0) AS news_count, coalesce(u.count, 0) AS new_users_count
  FROM date_series ds
  LEFT JOIN (SELECT criado_em::date AS "date", count(*) AS count FROM public.news GROUP BY "date") n ON ds.report_date = n."date"
  LEFT JOIN (SELECT created_at::date AS "date", count(*) AS count FROM public.profiles GROUP BY "date") u ON ds.report_date = u."date"
  ORDER BY ds.report_date ASC;
$$;

-- SEÇÃO 6: GATILHO DE CRIAÇÃO DE PERFIL
-- O gatilho agora insere na tabela 'profiles' quando um novo usuário se registra.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, "role", status, credits)
  VALUES (new.id, split_part(new.email, '@', 1), 'user', 'active', 10);
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
*/
import { supabase } from './supabaseClient';
// FIX: Added AIPlatformSettings to the import list to resolve a type error.
import { User, Log, UserRole, NewsStatus, NewsArticle, UserStatus, Transaction, TransactionStatus, PaymentMethod, PaymentSettings, MultiAISettings, AILog, CreditPackage, AIModel, AIPlatformSettings } from '../types';

// --- NEW USER MANAGEMENT FUNCTIONS ---

export interface CreateUserPayload {
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  credits: number;
  plan?: string;
}

/**
 * Creates a new user in authentication and in the 'profiles' table.
 * It uses a secure RPC function (`create_new_user`) for robust creation.
 * @param payload New user data.
 * @param adminUserId ID of the admin performing the action.
 */
export const createUser = async (
  payload: CreateUserPayload,
  adminUserId: string
): Promise<User> => {
  const { data: newUser, error: rpcError } = await supabase.rpc('create_new_user', {
    p_email: payload.email,
    p_password: payload.password,
    p_full_name: payload.full_name,
    p_role: payload.role,
    p_credits: payload.credits,
    p_status: 'active',
    p_plan: payload.plan
  });

  if (rpcError) {
    console.error(`RPC call to 'create_new_user' failed:`, rpcError.message || rpcError);
    if (rpcError.message.includes('duplicate key') || rpcError.message.includes('already exists')) {
      throw new Error('Um usuário com este email já existe.');
    }
    if (rpcError.message.includes('function public.create_new_user does not exist')) {
        throw new Error("Falha ao criar usuário: A função 'create_new_user' não foi encontrada. Execute o script SQL em services/adminService.ts.");
    }
    throw new Error(`Falha ao criar usuário via RPC: ${rpcError.message}.`);
  }

  if (!newUser) {
      throw new Error("A criação do usuário não retornou um perfil, mas não gerou erro.");
  }
  
  const { error: logError } = await supabase.from('logs').insert({
    usuario_id: adminUserId,
    acao: 'create_user',
    modulo: 'Usuários',
    detalhes: {
      new_user_email: payload.email,
      role_assigned: payload.role,
      initial_credits: payload.credits,
    },
  });

  if (logError) {
    console.error(`Failed to create audit log for user creation:`, logError.message);
  }

  return newUser as User;
};


interface GetUsersParams {
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
  page?: number;
  limit?: number;
}

interface GetUsersResult {
    users: User[];
    count: number;
}

/**
 * Fetches users with filtering and pagination from the single 'users' view.
 * Returns a list of users and the total count for pagination.
 */
export const getUsers = async ({
  role = 'all',
  status = 'all',
  page = 1,
  limit = 10,
}: GetUsersParams): Promise<GetUsersResult> => {
  let query = supabase
    .from('users')
    .select('id, email, full_name, role, status, credits, plan', { count: 'exact' });

  if (role !== 'all') {
    query = query.eq('role', role);
  }
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching users:', error.message);
    throw error;
  }

  return { users: data || [], count: count ?? 0 };
};

interface UpdateUserPayload {
  role?: UserRole;
  credits?: number;
  status?: UserStatus;
  plan?: string;
}

/**
 * Updates a user's data in the 'profiles' table and creates an audit log.
 * @param targetUserId ID of the user to be modified.
 * @param updates Object with the fields to be updated.
 * @param adminUserId ID of the admin performing the action.
 */
export const updateUser = async (
  targetUserId: string,
  updates: UpdateUserPayload,
  adminUserId: string
): Promise<User> => {
  const { data: currentUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (fetchError || !currentUser) {
    throw new Error('Usuário a ser atualizado não encontrado.');
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', targetUserId);
    
  if (updateError) throw updateError;
  
  const { data: updatedUser, error: refetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (refetchError || !updatedUser) throw new Error('Falha ao recarregar usuário após atualização.');


  // Create audit log for changes
  const changes: Record<string, { from: any; to: any }> = {};
  Object.keys(updates).forEach(key => {
    const typedKey = key as keyof UpdateUserPayload;
    if (updates[typedKey] !== currentUser[typedKey]) {
      changes[typedKey] = { from: currentUser[typedKey], to: updates[typedKey] };
    }
  });

  if (Object.keys(changes).length > 0) {
    await supabase.from('logs').insert({
      usuario_id: adminUserId,
      acao: 'update_user',
      modulo: 'Usuários',
      detalhes: { target_user_id: targetUserId, changes },
    });
  }

  return updatedUser;
};


// --- NEWS & LOGS FUNCTIONS ---

interface GetNewsParams {
  status?: NewsStatus | 'all';
  page?: number;
  limit?: number;
}

interface GetNewsResult {
  news: NewsArticle[];
  count: number;
}

/**
 * Busca notícias com informações do autor, com suporte a filtros e paginação.
 */
export const getNewsWithAuthors = async ({
  status = 'all',
  page = 1,
  limit = 10,
}: GetNewsParams): Promise<GetNewsResult> => {
  let query = supabase
    .from('news')
    .select('*, author:users(email)', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('criado_em', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching news with authors:', error.message);
    throw error;
  }

  return { news: (data as NewsArticle[]) || [], count: count ?? 0 };
};

export const updateNewsStatus = async (newsId: number, status: NewsStatus, adminUserId: string): Promise<NewsArticle> => {
    const { data, error } = await supabase
        .from('news')
        .update({ status })
        .eq('id', newsId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating news status:', error.message);
        throw error;
    }

    const { error: logError } = await supabase.from('logs').insert({
        usuario_id: adminUserId,
        acao: `update_news_status`,
        modulo: 'Notícias',
        detalhes: {
            news_id: newsId,
            new_status: status,
        }
    });

    if (logError) {
        console.error('Failed to create audit log for news status update:', logError.message);
    }

    return data;
};

export const updateNewsArticle = async (newsId: number, titulo: string, conteudo: string, adminUserId: string): Promise<NewsArticle> => {
    const { data: currentNews, error: fetchError } = await supabase
        .from('news')
        .select('titulo, conteudo')
        .eq('id', newsId)
        .single();
    
    if (fetchError || !currentNews) {
        throw new Error("Could not find news article to update.");
    }

    const { data, error } = await supabase
        .from('news')
        .update({ titulo, conteudo })
        .eq('id', newsId)
        .select()
        .single();

    if (error) {
        console.error('Error updating news article:', error.message);
        throw error;
    }

    const changes: Record<string, any> = {};
    if (titulo !== currentNews.titulo) {
        changes.title = { from: currentNews.titulo, to: titulo };
    }
    if (conteudo !== currentNews.conteudo) {
        changes.content = "updated";
    }

    if (Object.keys(changes).length > 0) {
        const { error: logError } = await supabase.from('logs').insert({
            usuario_id: adminUserId,
            acao: 'update_news_content',
            modulo: 'Notícias',
            detalhes: {
                news_id: newsId,
                changes,
            },
        });
        if (logError) {
            console.error('Failed to log news article update:', logError.message);
        }
    }

    return data;
};

export interface GetLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  module?: string;
  searchText?: string;
}

export interface GetLogsResult {
  logs: Log[];
  count: number;
}

export const getLogs = async ({
  page = 1,
  limit = 15,
  action,
  module,
  searchText,
}: GetLogsParams): Promise<GetLogsResult> => {
  let query = supabase
    .from('logs')
    .select('*, user_email:users(email)', { count: 'exact' });

  if (action && action !== 'all') {
    query = query.eq('acao', action);
  }

  if (module && module !== 'all') {
    query = query.eq('modulo', module);
  }
  
  if (searchText) {
    query = query.ilike('acao', `%${searchText}%`);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('data', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching logs:', error.message);
    throw error;
  }
  
  return {
    logs: data?.map((log: any) => ({
      ...log,
      user_email: log.user_email?.email || 'N/A',
    })) || [],
    count: count ?? 0,
  };
};

// --- BILLING FUNCTIONS ---

export interface GetTransactionsParams {
  status?: TransactionStatus | 'all';
  method?: PaymentMethod | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface GetTransactionsResult {
  transactions: Transaction[];
  count: number;
}

export const getTransactions = async ({
  status = 'all',
  method = 'all',
  startDate,
  endDate,
  page = 1,
  limit = 15,
}: GetTransactionsParams): Promise<GetTransactionsResult> => {
  let query = supabase
    .from('transactions') 
    .select('*, user:users(email)', { count: 'exact' });

  if (status !== 'all') query = query.eq('status', status);
  if (method !== 'all') query = query.eq('metodo', method);
  if (startDate) query = query.gte('data', `${startDate}T00:00:00.000Z`);
  if (endDate) query = query.lte('data', `${endDate}T23:59:59.999Z`);
  
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('data', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching transactions:', error.message);
    throw new Error('Falha ao buscar transações. Verifique se a view "transactions" existe e as permissões RLS estão corretas.');
  }
  
  return { transactions: (data as any[]) || [], count: count ?? 0 };
};

export const getApprovedRevenueInRange = async (startDate?: string, endDate?: string): Promise<number> => {
    let query = supabase
      .from('transactions')
      .select('valor')
      .eq('status', 'approved');
      
    if (startDate) query = query.gte('data', `${startDate}T00:00:00.000Z`);
    if (endDate) query = query.lte('data', `${endDate}T23:59:59.999Z`);
    
    const { data, error } = await query;

    if (error) {
        console.error('Error fetching approved revenue:', error.message);
        throw error;
    }

    const total = data?.reduce((sum, transaction) => sum + transaction.valor, 0) || 0;
    return total;
};

// --- PAYMENT SETTINGS FUNCTIONS ---

const SETTINGS_TABLE = 'settings';

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
    // Fetch gateway settings (new format)
    const { data: gatewaySettings, error: gatewaysError } = await supabase
        .from(SETTINGS_TABLE)
        .select('chave, valor')
        .eq('categoria', 'gateway');

    // Fetch credit packages (unchanged)
    const { data: packagesData, error: packagesError } = await supabase
        .from('pacotes_credito')
        .select('*')
        .order('preco', { ascending: true });

    if (gatewaysError) {
        console.error('Error fetching payment gateways:', gatewaysError.message);
        throw new Error('Falha ao carregar as configurações de gateways de pagamento.');
    }
    if (packagesError) {
        console.error('Error fetching credit packages:', packagesError.message);
        throw new Error('Falha ao carregar os pacotes de crédito.');
    }

    // Reconstruct the gateways object from individual rows
    const gateways: PaymentSettings['gateways'] = {
        stripe: { enabled: false, publicKey: '', secretKey: '' },
        mercadoPago: { enabled: false, publicKey: '', secretKey: '' },
    };

    gatewaySettings?.forEach(setting => {
        const { chave, valor } = setting;
        const isTrue = String(valor).toLowerCase() === 'true';

        if (chave === 'stripe_enabled') gateways.stripe.enabled = isTrue;
        else if (chave === 'stripe_publicKey') gateways.stripe.publicKey = valor;
        else if (chave === 'stripe_secretKey') gateways.stripe.secretKey = valor;
        else if (chave === 'mercadoPago_enabled') gateways.mercadoPago.enabled = isTrue;
        else if (chave === 'mercadoPago_publicKey') gateways.mercadoPago.publicKey = valor;
        else if (chave === 'mercadoPago_secretKey') gateways.mercadoPago.secretKey = valor;
    });
    
    const packages = packagesData ?? [];

    return { gateways, packages };
};

export const saveGatewaySettings = async (gateways: PaymentSettings['gateways'], adminUserId: string): Promise<void> => {
    const gatewayRows = [
        { chave: 'stripe_enabled', valor: String(gateways.stripe.enabled), categoria: 'gateway' },
        { chave: 'stripe_publicKey', valor: gateways.stripe.publicKey, categoria: 'gateway' },
        { chave: 'stripe_secretKey', valor: gateways.stripe.secretKey, categoria: 'gateway' },
        { chave: 'mercadoPago_enabled', valor: String(gateways.mercadoPago.enabled), categoria: 'gateway' },
        { chave: 'mercadoPago_publicKey', valor: gateways.mercadoPago.publicKey, categoria: 'gateway' },
        { chave: 'mercadoPago_secretKey', valor: gateways.mercadoPago.secretKey, categoria: 'gateway' },
    ];

    const { error } = await supabase.from(SETTINGS_TABLE).upsert(gatewayRows);

    if (error) {
        console.error('Error saving gateway settings:', error.message);
        throw new Error('Falha ao salvar as configurações de gateways.');
    }

    const { error: logError } = await supabase.from('logs').insert({
        usuario_id: adminUserId,
        acao: 'update_gateway_settings',
        modulo: 'Pagamentos',
        detalhes: { updated_gateways: Object.keys(gateways) }
    });

    if (logError) {
        console.error('Failed to log gateway settings update:', logError.message);
    }
};

export const saveCreditPackages = async (packages: CreditPackage[], adminUserId: string): Promise<void> => {
    const { error } = await supabase
        .from('pacotes_credito')
        .upsert(packages);

    if (error) {
        console.error('Error saving credit packages:', error.message);
        throw new Error('Falha ao salvar os pacotes de crédito.');
    }
    
    const { error: logError } = await supabase.from('logs').insert({
        usuario_id: adminUserId,
        acao: 'update_credit_packages',
        modulo: 'Pagamentos',
        detalhes: { package_count: packages.length }
    });

    if (logError) {
        console.error('Failed to log credit packages update:', logError.message);
    }
};


// --- MULTI-AI SETTINGS FUNCTIONS ---

const MULTI_AI_PLATFORMS_KEY = 'multi_ai_platforms';

export const getMultiAISettings = async (): Promise<MultiAISettings> => {
    // FIX: Changed column name from 'key' to 'chave' to match the database schema.
    const { data: platformsData, error: platformsError } = await supabase
        .from(SETTINGS_TABLE)
        .select('valor')
        .eq('chave', MULTI_AI_PLATFORMS_KEY)
        .maybeSingle(); // FIX: Use maybeSingle to avoid errors on missing settings row.

    const { data: modelsData, error: modelsError } = await supabase
        .from('modelos_ia')
        .select('*');

    // FIX: Simplified error check since maybeSingle() won't throw a "0 rows" error.
    if (platformsError) {
        console.error('Error fetching multi-AI platforms:', platformsError.message);
        throw new Error('Falha ao carregar as configurações de plataformas de IA.');
    }
    if (modelsError) {
        console.error('Error fetching AI models:', modelsError.message);
        throw new Error('Falha ao carregar os modelos de IA.');
    }
    
    // FIX: Changed property access from .value to .valor.
    const platforms: AIPlatformSettings = platformsData?.valor ?? {
        gemini: { enabled: true, apiKey: '', costPerMillionTokens: 0.50, maxTokens: 8192 },
        openai: { enabled: false, apiKey: '', costPerMillionTokens: 1.00, maxTokens: 4096 },
        claude: { enabled: false, apiKey: '', costPerMillionTokens: 1.50, maxTokens: 100000 },
    };

    const models: AIModel[] = (modelsData ?? []).map(m => ({
        ...m,
        ativo: m.status === 'active' // Convert string status to boolean
    }));

    return { platforms, models };
};


export const updateMultiAISettings = async (settings: MultiAISettings, adminUserId: string): Promise<MultiAISettings> => {
    // 1. Update Platforms in settings table
    // FIX: Changed column name from 'key' to 'chave' in the upsert payload.
    const { error: platformsError } = await supabase
        .from(SETTINGS_TABLE)
        .upsert({ chave: MULTI_AI_PLATFORMS_KEY, valor: settings.platforms });
    
    if (platformsError) {
        console.error('Error updating multi-AI platforms:', platformsError.message);
        throw new Error('Falha ao salvar as configurações de plataformas de IA.');
    }

    // 2. Update AI Models in modelos_ia table
    const modelsToUpsert = settings.models.map(m => ({
        ...m,
        status: m.ativo ? 'active' : 'inactive' // Convert boolean back to string status
    }));
    const { error: modelsError } = await supabase
        .from('modelos_ia')
        .upsert(modelsToUpsert);

    if (modelsError) {
        console.error('Error updating AI models:', modelsError.message);
        throw new Error('Falha ao salvar os modelos de IA.');
    }
    
    // 3. Log the update
    const { error: logError } = await supabase.from('logs').insert({
        usuario_id: adminUserId,
        acao: 'update_multi_ai_settings',
        modulo: 'Sistema Multi-IA',
        detalhes: {
            updated_platforms: Object.keys(settings.platforms),
            model_count: settings.models.length,
        }
    });

    if (logError) {
        console.error('Failed to create audit log for multi-AI settings update:', logError.message);
    }

    return settings;
};

// --- AI LOGS FUNCTIONS ---

export interface GetAILogsParams {
  page?: number;
  limit?: number;
}

export interface GetAILogsResult {
  logs: AILog[];
  count: number;
}

/**
 * Fetches AI usage logs with pagination, joining user data directly in the query.
 */
export const getAILogs = async ({
  page = 1,
  limit = 15,
}: GetAILogsParams): Promise<GetAILogsResult> => {
  // REFACTOR: Changed from a manual two-step fetch to a direct join with Supabase
  // for better performance and code consistency with other services.
  let query = supabase
    .from('consumo_ia')
    .select('*, user:users(email)', { count: 'exact' });
  
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('data', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching AI logs with user join:', error.message);
    throw new Error('Falha ao buscar logs de uso da IA. Verifique se a tabela "consumo_ia" e a relação com "users" existem.');
  }

  // Supabase join already structures the data; we just ensure it fits our type by
  // flattening the nested user object.
  const enrichedLogs = data?.map((log: any) => ({
    ...log,
    user: {
      email: log.user?.email || 'N/A',
    },
  })) || [];

  return { logs: enrichedLogs as AILog[], count: count ?? 0 };
};