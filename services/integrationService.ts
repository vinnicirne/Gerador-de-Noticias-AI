
import { IntegrationConfig, GeneratedNews, AnalyticsData, FeedbackLog } from '../types';
import { notificationService } from './notificationService';

const STORAGE_KEY = 'gdn_integrations_config';
const FEEDBACK_KEY = 'gdn_feedback_logs';

class IntegrationService {
  private config: IntegrationConfig;
  private feedbackLogs: FeedbackLog[];

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.config = stored ? JSON.parse(stored) : {
      aiModel: 'gemini-2.5-flash',
      wordpress: { connected: false, siteUrl: '', username: '' },
      googleAnalytics: { connected: false, propertyId: '' },
      searchConsole: { connected: false, siteUrl: '' }
    };

    const storedFeedback = localStorage.getItem(FEEDBACK_KEY);
    this.feedbackLogs = storedFeedback ? JSON.parse(storedFeedback) : [];
  }

  getConfig(): IntegrationConfig {
    return this.config;
  }

  saveConfig(newConfig: IntegrationConfig) {
    this.config = newConfig;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    notificationService.notify('Configurações salvas com sucesso!', 'success');
  }

  // --- GESTÃO DE MODELO IA ---
  getAIModel(): string {
    return this.config.aiModel || 'gemini-2.5-flash';
  }

  setAIModel(modelName: string) {
    const newConfig = { ...this.config, aiModel: modelName };
    this.saveConfig(newConfig);
  }

  // --- SISTEMA DE FEEDBACK ---
  logFeedback(type: 'news' | 'copy' | 'landing-page', rating: 'up' | 'down', context: string) {
    const newLog: FeedbackLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      rating,
      timestamp: new Date().toLocaleString(),
      context
    };
    this.feedbackLogs.unshift(newLog); // Adiciona no início
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(this.feedbackLogs));
    
    const msg = rating === 'up' ? 'Obrigado! O sistema aprenderá com isso.' : 'Obrigado pelo alerta. Vamos melhorar.';
    notificationService.notify(msg, 'info');
  }

  getFeedbackLogs(): FeedbackLog[] {
    return this.feedbackLogs;
  }

  // --- INTEGRAÇÕES EXTERNAS ---

  // Simula publicação no WordPress
  async publishToWordPress(news: GeneratedNews): Promise<string> {
    if (!this.config.wordpress?.connected) {
      throw new Error('WordPress não está conectado. Configure em Integrações.');
    }

    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Aqui seria uma chamada fetch real para a API REST do WP
    // const response = await fetch(`${this.config.wordpress.siteUrl}/wp-json/wp/v2/posts`, ...);
    
    console.log(`[Integration] Publishing to ${this.config.wordpress.siteUrl}:`, news.seo.title);
    
    return `${this.config.wordpress.siteUrl}/${news.seo.slug}`;
  }

  // Simula busca de dados do GA/Search Console
  async getPerformanceData(slug: string): Promise<AnalyticsData | null> {
    if (!this.config.googleAnalytics?.connected) {
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock de dados randômicos para demonstração
    return {
      views: Math.floor(Math.random() * 5000) + 100,
      clicks: Math.floor(Math.random() * 800) + 20,
      ctr: Number((Math.random() * 5).toFixed(2)),
      avgPosition: Number((Math.random() * 20 + 1).toFixed(1))
    };
  }
}

export const integrationService = new IntegrationService();
