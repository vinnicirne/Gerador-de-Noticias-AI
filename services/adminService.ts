
import { AdminUser, BillingTransaction, ActivityLog, AdminDashboardData, AdminChartData, AIPlatform, AIModel, AIUsageLog } from '../types';
import { userService } from './userService';

// Mock Data Generators (Mantidos para popular o resto do dashboard)
const generateMockUsers = (count: number): AdminUser[] => {
    const users: AdminUser[] = [];
    const types = ['subscriber', 'trial', 'admin'] as const;
    for (let i = 0; i < count; i++) {
        users.push({
            id: `usr_${Math.random().toString(36).substr(2, 9)}`,
            username: `user_${Math.floor(Math.random() * 10000)}`,
            email: `user${i}@example.com`,
            userType: types[Math.floor(Math.random() * types.length)],
            credits: Math.floor(Math.random() * 500),
            isActive: Math.random() > 0.1,
            dateJoined: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
            lastLogin: new Date(Date.now() - Math.random() * 100000000).toLocaleString(),
        });
    }
    return users;
};

const generateMockBilling = (count: number): BillingTransaction[] => {
    const txs: BillingTransaction[] = [];
    const statuses = ['paid', 'pending', 'failed'] as const;
    for (let i = 0; i < count; i++) {
        const amount = Math.floor(Math.random() * 200) + 29;
        txs.push({
            id: `tx_${Math.random().toString(36).substr(2, 9)}`,
            user: `user_${Math.floor(Math.random() * 50)}`,
            amount: amount,
            creditsPurchased: amount * 10,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'pix',
            date: new Date(Date.now() - Math.random() * 5000000000).toLocaleDateString(),
        });
    }
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Singleton Service
class AdminService {
    private users: AdminUser[];
    private billing: BillingTransaction[];
    
    // Multi-AI Data
    private aiPlatforms: AIPlatform[];
    private aiModels: AIModel[];
    private aiUsageLogs: AIUsageLog[];

    constructor() {
        this.users = generateMockUsers(50);
        this.billing = generateMockBilling(100);
        
        // Initialize Multi-AI Data
        this.aiPlatforms = [
            { id: 'plat_gemini', name: 'gemini', displayName: 'Google Gemini', apiKey: '', baseUrl: '', isActive: true, costPerToken: 0.000001, maxTokens: 32000 },
            { id: 'plat_openai', name: 'chatgpt', displayName: 'OpenAI ChatGPT', apiKey: '', baseUrl: '', isActive: false, costPerToken: 0.00001, maxTokens: 128000 },
            { id: 'plat_claude', name: 'claude', displayName: 'Anthropic Claude', apiKey: '', baseUrl: '', isActive: false, costPerToken: 0.000015, maxTokens: 200000 },
            { id: 'plat_mj', name: 'midjourney', displayName: 'Midjourney', apiKey: '', baseUrl: '', isActive: false, costPerToken: 0.05, maxTokens: 0 },
        ];

        this.aiModels = [
            { id: 'mod_gem_flash', platformId: 'plat_gemini', name: 'Gemini 2.5 Flash', modelId: 'gemini-2.5-flash', isActive: true, contextLength: 32000, supportsVision: true, supportsAudio: false },
            { id: 'mod_gem_pro', platformId: 'plat_gemini', name: 'Gemini 1.5 Pro', modelId: 'gemini-1.5-pro', isActive: false, contextLength: 1000000, supportsVision: true, supportsAudio: true },
            { id: 'mod_gpt4', platformId: 'plat_openai', name: 'GPT-4 Turbo', modelId: 'gpt-4-turbo', isActive: false, contextLength: 128000, supportsVision: true, supportsAudio: false },
            { id: 'mod_claude', platformId: 'plat_claude', name: 'Claude 3.5 Sonnet', modelId: 'claude-3-5-sonnet-20240620', isActive: false, contextLength: 200000, supportsVision: true, supportsAudio: false },
        ];

        this.aiUsageLogs = this.generateMockUsageLogs();
    }

    private generateMockUsageLogs(): AIUsageLog[] {
        const logs: AIUsageLog[] = [];
        for (let i = 0; i < 30; i++) {
            const tokens = Math.floor(Math.random() * 5000) + 100;
            logs.push({
                id: `log_${i}`,
                user: `user_${Math.floor(Math.random() * 10)}`,
                platform: Math.random() > 0.3 ? 'gemini' : 'openai',
                model: Math.random() > 0.3 ? 'gemini-2.5-flash' : 'gpt-4-turbo',
                inputTokens: Math.floor(tokens * 0.3),
                outputTokens: Math.floor(tokens * 0.7),
                totalTokens: tokens,
                cost: tokens * 0.000002,
                timestamp: new Date(Date.now() - Math.random() * 604800000).toLocaleString()
            });
        }
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    // Simulates the 'admin_dashboard_data' view logic
    private getChartData(): AdminChartData {
        const dates: string[] = [];
        const userRegistrations: number[] = [];
        const newsGenerated: number[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            
            userRegistrations.push(Math.floor(Math.random() * 5)); 
            
            const realActivityCount = userService.getActivities().filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate.getDate() === d.getDate() && logDate.getMonth() === d.getMonth() && log.action.includes('Gerou');
            }).length;

            newsGenerated.push(Math.max(realActivityCount, Math.floor(Math.random() * 8))); 
        }

        return { dates, userRegistrations, newsGenerated };
    }

    getDashboardData(): AdminDashboardData {
        const totalRevenue = this.billing.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
        const totalCredits = this.users.reduce((sum, u) => sum + u.credits, 0);
        const realActivities = userService.getActivities();
        
        return {
            totalUsers: this.users.length + 1, 
            activeUsers: this.users.filter(u => u.isActive).length + 1,
            totalCredits: totalCredits + userService.getUser().credits,
            totalRevenue,
            recentActivities: realActivities.slice(0, 20), 
            pendingBills: this.billing.filter(t => t.status === 'pending').length,
            chartData: this.getChartData()
        };
    }

    getUsers(): AdminUser[] { return this.users; }
    getBilling(): BillingTransaction[] { return this.billing; }

    // --- MULTI-AI METHODS ---
    
    getAIPlatforms(): AIPlatform[] { return this.aiPlatforms; }

    updateAIPlatform(id: string, updates: Partial<AIPlatform>): void {
        this.aiPlatforms = this.aiPlatforms.map(p => p.id === id ? { ...p, ...updates } : p);
    }

    getAIModels(): AIModel[] { return this.aiModels; }

    toggleAIModel(id: string): void {
        this.aiModels = this.aiModels.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m);
    }

    getAIUsageLogs(): AIUsageLog[] {
        // Combina logs reais com mocks para uma visualização mais rica
        return [...this.aiUsageLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    logAIUsage(log: AIUsageLog): void {
        this.aiUsageLogs.unshift(log);
    }

    getActiveGenerationModel(): { modelId: string, temperature: number } {
        const activeModel = this.aiModels.find(m => m.isActive);
        if (activeModel) {
            return { modelId: activeModel.modelId, temperature: 0.7 };
        }
        // Fallback para o modelo padrão se nenhum estiver ativo
        return { modelId: 'gemini-2.5-flash', temperature: 0.7 };
    }

    getAICostStats() {
        const totalCost = this.aiUsageLogs.reduce((acc, log) => acc + log.cost, 0);
        const totalTokens = this.aiUsageLogs.reduce((acc, log) => acc + log.totalTokens, 0);
        return { totalCost, totalTokens };
    }
}

export const adminService = new AdminService();
