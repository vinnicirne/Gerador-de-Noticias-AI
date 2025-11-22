// hooks/usePlan.ts
import { useState, useEffect } from 'react';
import { planService } from '../services/planService';
import { PlanMiddleware } from '../services/planMiddleware';
import { userService } from '../services/userService';
import { UserUsage, PlanTier } from '../types';

export const usePlan = (userId: string) => {
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsage();
  }, [userId]);

  const loadUsage = async () => {
    try {
      setIsLoading(true);
      const user = userService.getUser();
      const currentUsage = planService.calculateUsage(
        user.planTier,
        user.usageStats.creditsUsedThisMonth,
        user.usageStats.generationsToday,
        user.usageStats.lastResetDate,
        new Date(user.usageStats.lastResetDate.getFullYear(), user.usageStats.lastResetDate.getMonth() + 1, user.usageStats.lastResetDate.getDate())
      );
      setUsage(currentUsage);
    } catch (err) {
      setError('Erro ao carregar dados de uso');
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerate = async (modelId: string): Promise<{ allowed: boolean; reason?: string }> => {
    return await PlanMiddleware.canGenerate(userId, modelId);
  };

  const canViewHistory = async (daysRequested: number): Promise<boolean> => {
    return await PlanMiddleware.canViewHistory(userId, daysRequested);
  };

  const canUseAPI = async (): Promise<boolean> => {
    return await PlanMiddleware.canUseAPI(userId);
  };

  const changePlan = async (newTier: PlanTier) => {
    if (!usage) return { success: false, message: 'Dados de uso não carregados' };
    
    const result = await planService.changePlan(userId, newTier, usage.planTier);
    if (result.success && !planService['isDowngrade'](usage.planTier, newTier)) {
        userService.changePlan(newTier);
    }
    return result;
  };

  return {
    usage,
    isLoading,
    error,
    canGenerate,
    canViewHistory,
    canUseAPI,
    changePlan,
    refreshUsage: loadUsage
  };
};
