// services/planMiddleware.ts
import { planService } from './planService';
import { userService } from './userService';
import { PlanTier, UserUsage } from '../types';

export class PlanMiddleware {
  
  /**
   * Middleware para verificar se pode gerar conteúdo
   */
  static async canGenerate(userId: string, modelId: string): Promise<{ allowed: boolean; reason?: string }> {
    
    const usage = await this.getUserUsage(userId);

    // Verifica créditos
    const creditCheck = planService.canPerformAction(usage, 'generate');
    if (!creditCheck.allowed) {
      planService.notifyLimitWarnings([{
        level: 'critical',
        message: creditCheck.reason || 'Limite atingido',
        percentage: 100
      }]);
      return creditCheck;
    }

    // Verifica acesso ao modelo
    const modelCheck = planService.canPerformAction(usage, 'access_model', { modelId });
    if (!modelCheck.allowed) {
      return modelCheck;
    }

    // Envia avisos se necessário
    if (usage.warnings.length > 0) {
      planService.notifyLimitWarnings(usage.warnings);
    }

    return { allowed: true };
  }

  /**
   * Middleware para acesso ao histórico
   */
  static async canViewHistory(userId: string, daysRequested: number): Promise<boolean> {
    const usage = await this.getUserUsage(userId);
    const check = planService.canPerformAction(usage, 'view_history', { historyDays: daysRequested });
    return check.allowed;
  }

  /**
   * Middleware para API access
   */
  static async canUseAPI(userId: string): Promise<boolean> {
    const usage = await this.getUserUsage(userId);
    const check = planService.canPerformAction(usage, 'use_api');
    return check.allowed;
  }

  /**
   * Helper: Busca uso atual do usuário
   */
  private static async getUserUsage(userId: string): Promise<UserUsage> {
    const user = userService.getUser();
    
    return planService.calculateUsage(
      user.planTier,
      user.usageStats.creditsUsedThisMonth,
      user.usageStats.generationsToday,
      user.usageStats.lastResetDate,
      new Date(user.usageStats.lastResetDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    );
  }
}
