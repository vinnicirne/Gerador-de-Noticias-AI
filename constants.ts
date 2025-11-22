
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
