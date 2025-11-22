// services/planService.ts
import { PLAN_CONFIGS } from '../constants';
import { PlanTier, UserUsage, PlanLimits, PlanChangeResult } from '../types';
import { notificationService } from './notificationService';

class PlanService {
  
  /**
   * Verifica se o usuário pode realizar uma ação baseado no plano
   */
  canPerformAction(
    usage: UserUsage, 
    action: 'generate' | 'access_model' | 'view_history' | 'use_api',
    context?: { modelId?: string; historyDays?: number }
  ): { allowed: boolean; reason?: string } {
    
    const plan = PLAN_CONFIGS[usage.planTier];

    switch (action) {
      case 'generate':
        // Verifica créditos
        if (!plan.isUnlimited && usage.creditsRemaining <= 0) {
          return { 
            allowed: false, 
            reason: 'Sem créditos disponíveis. Faça upgrade ou recarregue.' 
          };
        }

        // Verifica limite diário (apenas para Free)
        if (plan.restrictions.maxGenerationsPerDay) {
          if (usage.generationsToday >= plan.restrictions.maxGenerationsPerDay) {
            return { 
              allowed: false, 
              reason: `Limite diário atingido (${plan.restrictions.maxGenerationsPerDay} gerações).` 
            };
          }
        }

        return { allowed: true };

      case 'access_model':
        if (!context?.modelId) return { allowed: false, reason: 'Modelo não especificado' };
        
        const allowedModels = plan.restrictions.allowedModels;
        
        // Enterprise tem acesso a tudo
        if (allowedModels.includes('*')) return { allowed: true };
        
        // Verifica se o modelo está na lista permitida
        if (!allowedModels.includes(context.modelId)) {
          return { 
            allowed: false, 
            reason: `Modelo ${context.modelId} disponível apenas em planos superiores.` 
          };
        }

        return { allowed: true };

      case 'view_history':
        if (!context?.historyDays) return { allowed: true };
        
        if (context.historyDays > plan.features.historyDays) {
          return { 
            allowed: false, 
            reason: `Histórico limitado a ${plan.features.historyDays} dias no seu plano.` 
          };
        }

        return { allowed: true };

      case 'use_api':
        if (!plan.features.apiAccess) {
          return { 
            allowed: false, 
            reason: 'Acesso API disponível apenas no plano Enterprise.' 
          };
        }

        return { allowed: true };

      default:
        return { allowed: false, reason: 'Ação desconhecida' };
    }
  }

  /**
   * Calcula uso atual do usuário e gera alertas
   */
  calculateUsage(
    planTier: PlanTier,
    creditsUsed: number,
    generationsToday: number,
    periodStart: Date,
    periodEnd: Date
  ): UserUsage {
    
    const plan = PLAN_CONFIGS[planTier];
    const creditsRemaining = plan.isUnlimited 
      ? 999999 
      : Math.max(0, plan.creditsPerMonth - creditsUsed);

    const usagePercentage = plan.isUnlimited 
      ? 0 
      : (creditsUsed / plan.creditsPerMonth) * 100;

    const warnings: UserUsage['warnings'] = [];

    // Alertas de créditos
    if (usagePercentage >= 90) {
      warnings.push({
        level: 'critical',
        message: '⚠️ Apenas 10% dos créditos restantes! Considere fazer upgrade.',
        percentage: usagePercentage
      });
    } else if (usagePercentage >= 75) {
      warnings.push({
        level: 'warning',
        message: '⚡ Você usou 75% dos seus créditos mensais.',
        percentage: usagePercentage
      });
    } else if (usagePercentage >= 50) {
      warnings.push({
        level: 'info',
        message: '📊 Metade dos créditos do mês foram utilizados.',
        percentage: usagePercentage
      });
    }

    // Alerta de limite diário (Free)
    if (plan.restrictions.maxGenerationsPerDay) {
      const dailyPercentage = (generationsToday / plan.restrictions.maxGenerationsPerDay) * 100;
      if (dailyPercentage >= 80) {
        warnings.push({
          level: 'warning',
          message: `🕐 ${plan.restrictions.maxGenerationsPerDay - generationsToday} gerações restantes hoje.`,
          percentage: dailyPercentage
        });
      }
    }

    return {
      userId: '',
      planTier,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      creditsUsed,
      creditsRemaining,
      generationsToday,
      lastResetDate: periodStart,
      warnings
    };
  }

  /**
   * Gerencia upgrade/downgrade de plano
   */
  async changePlan(
    userId: string, 
    newTier: PlanTier,
    currentTier: PlanTier
  ): Promise<PlanChangeResult> {
    
    const currentPlan = PLAN_CONFIGS[currentTier];
    const newPlan = PLAN_CONFIGS[newTier];

    const daysRemaining = this.calculateDaysRemaining();
    const proratedAmount = this.calculateProration(
      currentPlan.price, 
      newPlan.price, 
      daysRemaining
    );

    if (newTier === currentTier) {
      return { success: false, message: 'Você já está neste plano.' };
    }

    if (this.isDowngrade(currentTier, newTier)) {
      return {
        success: true,
        message: `Downgrade para ${newPlan.name} agendado para o fim do período. Recursos serão limitados em ${daysRemaining} dias.`,
        prorated: 0
      };
    }

    return {
      success: true,
      message: `Upgrade para ${newPlan.name} ativado! Créditos adicionais disponíveis agora.`,
      prorated: proratedAmount
    };
  }

  private isDowngrade(current: PlanTier, target: PlanTier): boolean {
    const hierarchy: Record<PlanTier, number> = { free: 0, pro: 1, enterprise: 2 };
    return hierarchy[target] < hierarchy[current];
  }

  private calculateDaysRemaining(): number {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateProration(currentPrice: number, newPrice: number, daysRemaining: number): number {
    const dailyDiff = (newPrice - currentPrice) / 30;
    return Math.max(0, dailyDiff * daysRemaining);
  }

  /**
   * Envia notificações de limite próximo
   */
  notifyLimitWarnings(warnings: UserUsage['warnings']): void {
    warnings.forEach(warning => {
      const type = warning.level === 'critical' ? 'error' : 'info';
      notificationService.notify(warning.message, type);
    });
  }

  /**
   * Retorna todos os planos disponíveis
   */
  getAllPlans(): PlanLimits[] {
    return Object.values(PLAN_CONFIGS);
  }

  /**
   * Retorna plano específico
   */
  getPlan(tier: PlanTier): PlanLimits {
    return PLAN_CONFIGS[tier];
  }
}

export const planService = new PlanService();