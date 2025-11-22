// hooks/usePlan.ts
import { useState, useEffect } from 'react';
import { planService } from '../services/planService';
import { PlanMiddleware } from '../services/planMiddleware';
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
      // Em produção, buscar do backend
      const mockUsage = planService.calculateUsage(
        'free',
        7,
        2,
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );
      mockUsage.userId = userId;
      setUsage(mockUsage);
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
    
    return await planService.changePlan(userId, newTier, usage.planTier);
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