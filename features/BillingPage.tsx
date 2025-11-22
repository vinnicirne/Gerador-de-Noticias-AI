// features/BillingPage.tsx
import React, { useState } from 'react';
import UsageDashboard from '../components/UsageDashboard';
import PlanUpgradeModal from '../components/PlanUpgradeModal';
import { usePlan } from '../hooks/usePlan';
import { PlanTier } from '../types';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';

const BillingPage: React.FC = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { usage, changePlan, refreshUsage } = usePlan(userService.getUser().id);

  const handleUpgrade = async (newPlan: PlanTier) => {
    const result = await changePlan(newPlan);
    if (result.success) {
      notificationService.notify(result.message, 'success');
      refreshUsage();
    } else {
      notificationService.notify(`Erro: ${result.message}`, 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Gerenciar Plano</h1>
        <p className="text-gray-400">
          Acompanhe seu uso e faça upgrade para desbloquear recursos exclusivos.
        </p>
      </header>

      <UsageDashboard onUpgradeClick={() => setIsUpgradeModalOpen(true)} />

      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={usage?.planTier || 'free'}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default BillingPage;
