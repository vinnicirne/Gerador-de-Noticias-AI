// features/BillingPage.tsx
import React, { useState } from 'react';
import UsageDashboard from '../components/UsageDashboard';
import PlanUpgradeModal from '../components/PlanUpgradeModal';
import { usePlan } from '../hooks/usePlan';
import { PlanTier } from '../types';

const BillingPage: React.FC = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { usage, changePlan, refreshUsage } = usePlan('user-123');

  const handleUpgrade = async (newPlan: PlanTier) => {
    const result = await changePlan(newPlan);
    if (result.success) {
      alert(result.message);
      refreshUsage();
    } else {
      alert(`Erro: ${result.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gerenciar Plano</h1>
          <p className="text-gray-400">
            Acompanhe seu uso e faça upgrade para desbloquear recursos exclusivos
          </p>
        </header>

        <UsageDashboard />

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="px-6 py-3 bg-[#1b8a0f] text-white rounded-lg hover:bg-[#24a813] transition-colors font-medium"
          >
            Fazer Upgrade
          </button>
          
          <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
            Ver Histórico de Faturas
          </button>
        </div>

        <PlanUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          currentPlan={usage?.planTier || 'free'}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>
  );
};

export default BillingPage;