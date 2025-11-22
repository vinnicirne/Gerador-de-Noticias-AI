// components/UsageDashboard.tsx
import React, { useState, useEffect } from 'react';
import { planService } from '../services/planService';
import { userService } from '../services/userService';
import { UserUsage, PlanLimits, PlanTier } from '../types';
import { usePlan } from '../hooks/usePlan';

interface UsageDashboardProps {
    onUpgradeClick: () => void;
}

const UsageDashboard: React.FC<UsageDashboardProps> = ({ onUpgradeClick }) => {
  const { usage, isLoading } = usePlan(userService.getUser().id);

  if (isLoading || !usage) return <div>Carregando...</div>;
  
  const plan = planService.getPlan(usage.planTier);
  const usagePercentage = plan.isUnlimited ? 0 : (usage.creditsUsed / plan.creditsPerMonth) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Plano Atual */}
      <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Plano {plan.name}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {plan.price === 0 ? 'Gratuito' : `R$ ${plan.price.toFixed(2)}/mês`}
            </p>
          </div>
          <button 
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-[#1b8a0f] text-white rounded-lg hover:bg-[#24a813] transition-colors text-sm font-medium"
          >
            Fazer Upgrade
          </button>
        </div>

        {/* Barra de Uso de Créditos */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-medium text-gray-400">Créditos Utilizados</span>
            <span className="text-xl font-bold text-white">
              {usage.creditsUsed} / {plan.isUnlimited ? '∞' : plan.creditsPerMonth}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercentage >= 90 ? 'bg-red-500' : 
                usagePercentage >= 75 ? 'bg-yellow-500' : 
                'bg-[#1b8a0f]'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {usage.creditsRemaining} créditos restantes este mês
          </p>
        </div>

        {/* Alertas */}
        {usage.warnings.length > 0 && (
          <div className="space-y-2">
            {usage.warnings.map((warning, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border ${
                  warning.level === 'critical' ? 'bg-red-900/20 border-red-500/30 text-red-400' :
                  warning.level === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400' :
                  'bg-blue-900/20 border-blue-500/30 text-blue-400'
                }`}
              >
                <p className="text-sm font-medium">{warning.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features do Plano */}
      <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Recursos do Plano</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Modelos de IA', value: plan.features.allModels ? 'Todos' : 'Básicos', active: true },
            { label: 'Histórico', value: `${plan.features.historyDays} dias`, active: true },
            { label: 'SEO Avançado', value: plan.features.seoAdvanced ? 'Sim' : 'Não', active: plan.features.seoAdvanced },
            { label: 'Acesso API', value: plan.features.apiAccess ? 'Sim' : 'Não', active: plan.features.apiAccess },
            { label: 'Suporte Prioritário', value: plan.features.prioritySupport ? 'Sim' : 'Não', active: plan.features.prioritySupport },
            { label: 'Branding Customizado', value: plan.features.customBranding ? 'Sim' : 'Não', active: plan.features.customBranding }
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
              <span className="text-sm text-gray-400">{feature.label}</span>
              <span className={`text-sm font-medium ${feature.active ? 'text-[#1b8a0f]' : 'text-gray-500'}`}>
                {feature.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Período de Faturamento */}
      <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Período de Faturamento</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Início</p>
            <p className="text-white font-medium">{usage.currentPeriodStart.toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Renovação em</p>
            <p className="text-[#1b8a0f] font-bold text-xl">
              {Math.ceil((usage.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Fim</p>
            <p className="text-white font-medium">{usage.currentPeriodEnd.toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;
