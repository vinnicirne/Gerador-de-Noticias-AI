import { UserProfile, ActivityLog, GenerationHistoryItem, PlanTier, CreditHistoryItem } from '../types';
import { notificationService } from './notificationService';

type UserUpdateListener = (user: UserProfile) => void;

class UserService {
    private user: UserProfile;
    private activityLogs: ActivityLog[];
    private generationHistory: GenerationHistoryItem[];
    private creditHistory: CreditHistoryItem[];
    private listeners: UserUpdateListener[] = [];

    constructor() {
        const today = new Date();
        this.user = {
            id: 'user_123',
            username: 'admin_demo',
            email: 'admin@gdn-ia.com',
            userType: 'admin',
            credits: 500,
            planTier: 'enterprise', // Mapeado de userType
            usageStats: {
              creditsUsedThisMonth: 5,
              generationsToday: 1,
              lastResetDate: new Date(today.getFullYear(), today.getMonth(), 1)
            },
            isActive: true,
            preferredAiModel: 'gemini-2.5-flash',
        };

        this.activityLogs = [ { id: 'log_init', user: 'admin_demo', action: 'Sistema Iniciado', details: 'Login efetuado', ip: '127.0.0.1', timestamp: new Date().toLocaleString() } ];
        this.generationHistory = [];
        this.creditHistory = [];
        this.mapUserTypeToPlan();
    }

    private mapUserTypeToPlan(): void {
        if (this.user.userType === 'admin') {
            this.user.planTier = 'enterprise';
        } else {
            this.user.planTier = 'free'; // Default para outros tipos
        }
    }

    public getUser(): UserProfile {
        return { ...this.user };
    }
    
    public getActivities(): ActivityLog[] {
        return [...this.activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    public getGenerationHistory(): GenerationHistoryItem[] {
        return [...this.generationHistory];
    }
    
    public addGenerationToHistory(item: Omit<GenerationHistoryItem, 'id' | 'createdAt'>): void {
        const newHistoryItem: GenerationHistoryItem = {
            id: `gen_${Date.now()}`,
            ...item,
            createdAt: new Date().toLocaleString()
        };
        this.generationHistory.unshift(newHistoryItem);
    }

    public isAdmin(): boolean {
        return this.user.userType === 'admin';
    }

    public recordGeneration(): void {
        this.user.usageStats.creditsUsedThisMonth += 1;
        this.user.usageStats.generationsToday += 1;
        this.logActivity('Geração de Conteúdo', 'Consumiu 1 crédito');
        this.notifyListeners();
    }
    
    public changePlan(newTier: PlanTier): void {
        this.user.planTier = newTier;
        // Reset usage on upgrade
        this.user.usageStats = {
            creditsUsedThisMonth: 0,
            generationsToday: 0,
            lastResetDate: new Date()
        };
        this.logActivity('Mudança de Plano', `Plano alterado para ${newTier}`);
        this.notifyListeners();
    }

    public logActivity(action: string, details: string): void {
        this.activityLogs.unshift({
            id: `log_${Date.now()}`,
            user: this.user.username,
            action: action,
            details: details,
            ip: '127.0.0.1', // Simulado
            timestamp: new Date().toLocaleString()
        });
    }

    // --- PREFERRED MODEL METHODS ---
    public getPreferredModel(): string | undefined {
        return this.user.preferredAiModel;
    }

    public setPreferredModel(modelId: string): void {
        this.user.preferredAiModel = modelId;
        this.notifyListeners();
        notificationService.notify(`Modelo preferido atualizado para: ${modelId}`, 'info');
    }

    public getHistory(): CreditHistoryItem[] {
        return [...this.creditHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    public hasCredits(amount: number): boolean {
        return this.user.credits >= amount;
    }

    public performTransaction(amount: number, description: string, type: 'purchase' | 'usage' | 'bonus'): void {
        const transactionAmount = type === 'usage' ? -amount : amount;
        this.user.credits += transactionAmount;

        const historyItem: CreditHistoryItem = {
            id: `cred_${Date.now()}`,
            date: new Date(),
            description: description,
            type: type,
            amount: transactionAmount
        };
        this.creditHistory.unshift(historyItem);
        this.notifyListeners();
    }

    public subscribe(listener: UserUpdateListener) {
        this.listeners.push(listener);
        listener(this.user);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.user));
    }
}

export const userService = new UserService();