// components/PlanUpgradeModal.tsx
import React, { useState } from 'react';
import { planService } from '../services/planService';
import { PlanLimits, PlanTier } from '../types';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  onUpgrade: (newPlan: PlanTier) => void;
}

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({ isOpen, onClose, currentPlan, onUpgrade }) => {
  const plans = planService.getAllPlans();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    if (selectedPlan) {
      onUpgrade(selectedPlan);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-[#136c0b]/30 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#136c0b]/30 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-2xl font-bold text-white">Escolha seu Plano</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.tier === currentPlan;
            const isSelected = selectedPlan === plan.tier;
            
            return (
              <div
                key={plan.tier}
                onClick={() => !isCurrent && setSelectedPlan(plan.tier)}
                className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-[#1b8a0f] bg-[#1b8a0f]/10' :
                  isCurrent ? 'border-blue-500 bg-blue-500/10' :
                  'border-gray-800 bg-gray-900/50 hover:border-[#136c0b]'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                    Plano Atual
                  </span>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1b8a0f]">
                    R$ {plan.price.toFixed(0)}
                  </span>
                  <span className="text-gray-400 text-sm">/mês</span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white font-bold">
                      {plan.isUnlimited ? 'Créditos Ilimitados' : `${plan.creditsPerMonth} créditos/mês`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">
                      Histórico {plan.features.historyDays === 999999 ? 'ilimitado' : `${plan.features.historyDays} dias`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">
                      {plan.features.allModels ? 'Todos os modelos' : 'Modelos básicos'}
                    </span>
                  </li>
                  {plan.features.seoAdvanced && (
                    <li className="flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">SEO Avançado</span>
                    </li>
                  )}
                  {plan.features.apiAccess && (
                    <li className="flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">Acesso API</span>
                    </li>
                  )}
                </ul>

                <button
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    isCurrent ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                    isSelected ? 'bg-[#1b8a0f] text-white hover:bg-[#24a813]' :
                    'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {isCurrent ? 'Plano Atual' : 'Selecionar'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-[#136c0b]/30 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpgrade}
            disabled={!selectedPlan}
            className="px-6 py-2 bg-[#1b8a0f] text-white rounded-lg hover:bg-[#24a813] disabled:opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Fazer Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeModal;
