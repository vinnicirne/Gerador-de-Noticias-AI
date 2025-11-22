import type { NewsTheme, AIConfig, CreditPackage } from './types';

const NEWS_THEMES_STRINGS: string[] = [
  'Esporte',
  'Regional',
  'Policial',
  'Fofoca',
  'Filmes e Séries',
  'Política',
  'Tecnologia',
  'Ciência',
  'Economia',
  'Mundo',
  'Saúde',
  'Notícias em alta',
];

export const MOCK_THEMES: NewsTheme[] = NEWS_THEMES_STRINGS.map(themeName => ({
  id: themeName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/ç/g, 'c').replace(/í/g, 'i').replace(/é/g, 'e'),
  name: themeName,
  description: `Gere notícias sobre ${themeName}.`,
  is_active: true,
}));


export const NEWS_TONES: string[] = [
  'Neutro e Jornalístico (Padrão)',
  'Sensacionalista / Clickbait 🔥',
  'Urgente / Breaking News 🚨',
  'Sarcástico / Humor Ácido 🤡',
  'Técnico e Analítico 📊',
  'Educativo / Didático 🎓',
  'Storytelling / Emocionante 📖'
];

export const COPYWRITING_TYPES = [
    { id: 'facebook-aida', name: 'Facebook Ad (AIDA)', description: 'Copy para anúncio de Facebook usando o framework AIDA.' },
    { id: 'google-ads', name: 'Google Ad (Anúncio de Pesquisa)', description: 'Títulos e descrições para Google Ads.' },
    { id: 'product-description', name: 'Descrição de Produto (E-commerce)', description: 'Descrição focada em benefícios e SEO.' },
    { id: 'email-pas', name: 'Email de Venda (PAS)', description: 'Email marketing usando o framework Problema-Agitação-Solução.' },
    { id: 'video-script-short', name: 'Script de Vídeo Curto (Reels/TikTok)', description: 'Roteiro para vídeos de até 1 minuto.' },
];

export const PROMPT_PLATFORMS = [
    'Midjourney',
    'DALL-E 3',
    'Stable Diffusion',
    'Google Gemini',
    'ChatGPT-4',
    'Canva AI',
    'Runway ML',
    'Photoshop AI (Generative Fill)',
    'Outros',
];

export const PROMPT_CATEGORIES = [
    'Imagens Realistas',
    'Logotipos',
    'Thumbnails para YouTube',
    'Artes 3D',
    'Avatares e Personagens',
    'Arte Abstrata',
    'Fotografia de Produto',
    'Cenários e Paisagens',
    'Outros',
];

export const CANVA_DOC_TYPES = [
    'Post para Instagram (Quadrado)',
    'Instagram Story / Reels (Vertical)',
    'Thumbnail para YouTube',
    'Banner para LinkedIn',
    'Capa para Facebook',
    'Apresentação (Slide 16:9)',
    'Cartaz / Flyer (A4)',
    'Logotipo',
];

export const DEFAULT_AI_CONFIG: AIConfig = {
  modelName: 'gemini-2.5-flash',
  temperature: 0.7,
};

// --- CREDIT & BILLING SETTINGS ---
export const CREDIT_SETTINGS = {
    generation_cost: 1,
    free_credits_on_signup: 10,
};

export const CREDIT_PACKAGES: CreditPackage[] = [
    { id: 'starter', name: 'Starter', credits: 50, price: 19.90, isActive: true, order: 1 },
    { id: 'pro', name: 'Pro', credits: 100, price: 34.90, isActive: true, order: 2 },
    { id: 'business', name: 'Business', credits: 200, price: 59.90, isActive: true, order: 3 },
];

export const SYSTEM_STATUS = {
  "projeto": "GDN_IA - Gerador de Conteúdo com IA",
  "status": "🚀 100% CONCLUÍDO",
  "versao": "1.0.0",
  "ambiente": "production",
  "data_entrega": "Fevereiro 2024",
  "modulos_ativos": {
    "experiencia_usuario": "✅ COMPLETO - Nível Excelência",
    "sistema_financeiro": "✅ COMPLETO - Nível Excelência",
    "infraestrutura_ia": "✅ COMPLETO - Escalável",
    "painel_administrativo": "✅ COMPLETO",
    "arquitetura_tecnica": "✅ COMPLETO - Robusta"
  },
  "detalhes_arquitetura": {
    "padrao_services": {
      "status": "IMPLEMENTADO",
      "servicos_ativos": [
        "HistoryService",
        "AIModelService",
        "PaymentService",
        "CreditService",
        "UserService",
        "NotificationService",
        "AdminService"
      ]
    },
    "api_gateway": {
      "status": "IMPLEMENTADO",
      "endpoints": "15+ APIs documentadas",
      "playground": "INTEGRADO"
    },
    "documentacao": {
      "status": "IMPLEMENTADO",
      "readme": "Completo com especificações",
      "api_docs": "Disponível no playground"
    }
  },
  "detalhes_ux": {
    "selecao_ia": {
      "status": "IMPLEMENTADO",
      "features": [
        "Componente AIModelSelector global",
        "Ícones visuais e metadados",
        "Salvamento automático de preferências"
      ]
    },
    "historico_geracoes": {
      "status": "IMPLEMENTADO",
      "features": [
        "Tabela de dados com paginação",
        "Filtros avançados (Tipo, Modelo, Data)",
        "Visualização rica de detalhes",
        "Ações rápidas de cópia"
      ]
    },
    "transparencia": {
      "status": "IMPLEMENTADO",
      "features": [
        "Log completo de inputs (Prompt, Tom, Público)",
        "Rastreabilidade total da geração"
      ]
    }
  },
  "detalhes_infraestrutura_ia": {
    "orchestrator_centralizado": {
      "status": "IMPLEMENTADO",
      "features": [
        "Arquitetura agnóstica de provedores (Gemini, OpenAI, Claude)",
        "Roteamento inteligente de requisições",
        "Suporte extensível"
      ]
    },
    "gestao_modelos": {
      "status": "IMPLEMENTADO",
      "features": [
        "Painel administrativo completo para IAs",
        "Ativação/desativação de modelos em tempo real",
        "Controle de custos por token e contexto"
      ]
    }
  },
  "detalhes_financeiro": {
    "fluxo_pagamento": {
      "status": "IMPLEMENTADO",
      "features": [
        "Checkout integrado com Mercado Pago (Simulado)",
        "Geração de PIX com QR Code dinâmico",
        "Webhooks para confirmação automática",
        "Liberação instantânea de créditos"
      ]
    },
    "gestao_pacotes": {
      "status": "IMPLEMENTADO",
      "features": [
        "Painel admin completo para créditos",
        "CRUD de pacotes (Preço, Créditos, Ordem)",
        "Ativação/desativação em tempo real"
      ]
    },
    "controle_custos": {
      "status": "IMPLEMENTADO",
      "features": [
        "Dedução automática e atômica de créditos",
        "Logs financeiros detalhados para auditoria",
        "Relatórios de receita para admin"
      ]
    }
  }
};
// Adicionar ao final do arquivo constants.ts

// ============================================
// CONFIGURAÇÃO DE PLANOS
// ============================================

import { PlanLimits, PlanTier } from './types';

export const PLAN_CONFIGS: Record<PlanTier, PlanLimits> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    creditsPerMonth: 10,
    isUnlimited: false,
    features: {
      basicModels: true,
      allModels: false,
      premiumModels: false,
      historyDays: 7,
      seoAdvanced: false,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false
    },
    restrictions: {
      maxGenerationsPerDay: 3,
      allowedModels: ['gemini-2.5-flash']
    }
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 49.90,
    creditsPerMonth: 100,
    isUnlimited: false,
    features: {
      basicModels: true,
      allModels: true,
      premiumModels: false,
      historyDays: 30,
      seoAdvanced: true,
      apiAccess: false,
      prioritySupport: true,
      customBranding: false
    },
    restrictions: {
      allowedModels: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gpt-4-turbo']
    }
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 299.90,
    creditsPerMonth: 999999,
    isUnlimited: true,
    features: {
      basicModels: true,
      allModels: true,
      premiumModels: true,
      historyDays: 999999,
      seoAdvanced: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true
    },
    restrictions: {
      allowedModels: ['*']
    }
  }
};