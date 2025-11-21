
export interface GeneratedNews {
  id?: string;
  title: string;
  body: string;
  imagePrompt: string;
  sources: Array<{
    uri: string;
    title: string;
  }>;
  seo: {
    focusKeyword: string;
    seoTitle: string;
    slug: string;
    metaDescription: string;
    tags: string[];
    altText: string;
  };
  created_at?: string;
}

export interface AppConfig {
  appName: string;
  logoUrl: string;
  supportEmail: string;
  whatsappNumber: string;
  contactMessage: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  status?: string;
  created_at?: string;
}

// FIX: Add the missing PlanConfig interface based on its usage in UpgradeModal and CheckoutModal.
export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  recurrence: 'Mensal' | 'Anual' | 'Único';
  recommended: boolean;
  active: boolean;
}