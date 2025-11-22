import { UserProfile, CreditHistoryItem, ActivityLog, GenerationHistoryItem } from '../types';
import { CREDIT_SETTINGS } from '../constants';
import { notificationService } from './notificationService';

type UserUpdateListener = (user: UserProfile) => void;

class UserService {
    private user: UserProfile;
    private transactionHistory: CreditHistoryItem[];
    private activityLogs: ActivityLog[];
    private generationHistory: GenerationHistoryItem[];
    private listeners: UserUpdateListener[] = [];

    constructor() {
        this.user = {
            id: 'user_123',
            username: 'admin_demo',
            email: 'admin@gdn-ia.com',
            userType: 'admin', 
            credits: CREDIT_SETTINGS.free_credits_on_signup,
            isActive: true,
            preferredAiModel: 'gemini-2.5-flash', // Inicia com um padrão
        };

        this.transactionHistory = [
            {
                id: 'tx_init',
                type: 'bonus',
                amount: CREDIT_SETTINGS.free_credits_on_signup,
                description: 'Créditos de boas-vindas',
                date: new Date()
            }
        ];

        this.activityLogs = [
            {
                id: 'log_init',
                user: 'admin_demo',
                action: 'Sistema Iniciado',
                details: 'Login efetuado com sucesso',
                ip: '127.0.0.1',
                timestamp: new Date().toLocaleString()
            }
        ];
        
        this.generationHistory = [];
    }

    public getUser(): UserProfile {
        return { ...this.user };
    }

    public getHistory(): CreditHistoryItem[] {
        return [...this.transactionHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
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

    public hasCredits(cost: number): boolean {
        return this.user.credits >= cost;
    }

    public performTransaction(amount: number, description: string, type: 'purchase' | 'usage' | 'bonus'): void {
        if (type === 'usage') {
            this.user.credits -= amount;
        } else {
            this.user.credits += amount;
        }

        this.transactionHistory.unshift({
            id: `tx_${Date.now()}`,
            type: type,
            amount: type === 'usage' ? -amount : amount,
            description: description,
            date: new Date()
        });

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
    // --- END PREFERRED MODEL ---


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