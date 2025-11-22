
export interface NewsTheme {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface RankMathSEOData {
  title: string;
  description: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  seoFocus: 'informacional' | 'comercial' | 'transacional' | string;
  keywordDifficulty: 'baixa' | 'média' | 'alta' | string;
  schemaType: 'Article' | 'NewsArticle' | 'WebPage' | 'Product' | string;
}

export interface ContentValidationMetrics {
  factualityScore: number;
  originalityScore: number;
  readabilityScore: number;
  seoScore: number;
  overallScore: number;
  suggestions: string[];
}

export interface SEOAnalysisReport {
  score: number;
  keywordDensity: {
    count: number;
    density: number;
    status: 'low' | 'good' | 'high';
  };
  metaAnalysis: {
    titleLength: number;
    titleHasKeyword: boolean;
    descriptionLength: number;
    descriptionHasKeyword: boolean;
  };
  recommendations: string[];
  schemaJsonLd: string;
  wordCount: number;
}

export interface CompetitionAnalysis {
  myContent: {
    wordCount: number;
    keywordDensity: number;
    readabilityScore: number;
  };
  competitorsAvg: {
    wordCount: number;
    keywordDensity: number;
    readabilityScore: number;
  };
  gapAnalysis: string[];
}

export interface VisualAssets {
    imagePrompts: string[];
    infographicSuggestions: string[];
}

export interface GeneratedNews {
  seo: RankMathSEOData;
  content: string;
  visualAssets?: VisualAssets;
  theme: NewsTheme;
  modelUsed: string;
  generatedAt: Date;
  isFromCache?: boolean;
  validation?: ContentValidationMetrics;
}

export interface AIConfig {
  modelName: string;
  temperature: number;
}

export interface LandingPageData {
  seo: RankMathSEOData;
  content: string;
  modelUsed: string;
  generatedAt: Date;
  isFromCache?: boolean;
  validation?: ContentValidationMetrics;
}

export interface GeneratedCopy {
  seo: RankMathSEOData;
  content: string;
  copyType: string;
  modelUsed: string;
  generatedAt: Date;
  isFromCache?: boolean;
  validation?: ContentValidationMetrics;
}

export interface GeneratedPrompt {
  prompt: string;
  platform: string;
  category: string;
  modelUsed: string;
  generatedAt: Date;
  isFromCache?: boolean;
}

export interface GeneratedCanvaStructure {
  content: string;
  docType: string;
  modelUsed: string;
  generatedAt: Date;
  isFromCache?: boolean;
}

export interface GenerationHistoryItem {
    id: string;
    generationType: 'news' | 'landing_page' | 'copy' | 'prompt' | 'canva';
    aiModel: string;
    promptSummary: string; 
    inputs?: any; // Stores the full configuration object used for generation
    result: any; 
    creditsUsed: number;
    createdAt: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export interface IntegrationConfig {
  aiModel?: string;
  wordpress?: {
    connected: boolean;
    siteUrl: string;
    username: string;
  };
  googleAnalytics?: {
    connected: boolean;
    propertyId: string;
  };
  searchConsole?: {
    connected: boolean;
    siteUrl: string;
  };
}

export interface AnalyticsData {
  views: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
}

export interface FeedbackLog {
  id: string;
  type: 'news' | 'copy' | 'landing-page';
  rating: 'up' | 'down';
  timestamp: string;
  context: string;
}

export type UserType = 'admin' | 'editor' | 'user';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  userType: UserType;
  credits: number;
  isActive: boolean;
  preferredAiModel?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  isActive: boolean;
  order: number;
}

export interface CreditHistoryItem {
  id: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  description: string;
  date: Date;
}

export type PaymentPlatform = 'mercadopago' | 'stripe' | 'pix';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface PaymentConfig {
    platform: PaymentPlatform;
    isActive: boolean;
    publicKey: string;
    accessToken: string;
}

export interface PaymentTransaction {
    id: string;
    paymentId: string;
    user: string;
    packageId: string;
    amount: number;
    credits: number;
    status: PaymentStatus;
    method: 'pix' | 'credit_card';
    createdAt: string;
    updatedAt: string;
    preferenceId?: string; 
    initPoint?: string; 
}

export interface MercadoPagoItem {
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
}

export interface MercadoPagoBackUrls {
    success: string;
    failure: string;
    pending: string;
}

export interface MercadoPagoPreference {
    items: MercadoPagoItem[];
    payer: { email: string };
    back_urls: MercadoPagoBackUrls;
    auto_return: string;
    external_reference: string;
    notification_url: string;
}

export interface MercadoPagoResponse {
    id: string;
    init_point: string; 
    sandbox_init_point: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  userType: 'admin' | 'subscriber' | 'trial';
  credits: number;
  isActive: boolean;
  dateJoined: string;
  lastLogin: string;
}

export interface BillingTransaction {
  id: string;
  user: string;
  amount: number;
  creditsPurchased: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: 'credit_card' | 'pix';
  date: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface AdminChartData {
    dates: string[];
    userRegistrations: number[];
    newsGenerated: number[];
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalCredits: number;
  totalRevenue: number;
  recentActivities: ActivityLog[];
  pendingBills: number;
  chartData: AdminChartData;
}

export type AIProviderName = 'gemini' | 'chatgpt' | 'claude' | 'sora' | 'midjourney' | 'dalle';

export interface AIPlatform {
    id: string;
    name: AIProviderName;
    displayName: string;
    apiKey: string;
    baseUrl: string;
    isActive: boolean;
    costPerToken: number;
    maxTokens: number;
}

export interface AIModel {
    id: string;
    platformId: string;
    name: string;
    modelId: string;
    isActive: boolean;
    contextLength: number;
    supportsVision: boolean;
    supportsAudio: boolean;
}

export interface AIUsageLog {
    id: string;
    user: string;
    platform: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    timestamp: string;
}
