import React, { useState, useCallback } from 'react';
import type { GeneratedCopy } from '../types';
import { generateMarketingCopy } from '../services/geminiService';
import { appCache } from '../services/cacheService';
import { creditService } from '../services/creditService';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';
import { CREDIT_SETTINGS } from '../constants';
import CopyGeneratorForm from '../components/CopyGeneratorForm';
import CopyGeneratorDisplay from '../components/CopyGeneratorDisplay';

const CopyGenerator: React.FC = () => {
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (copyType: { id: string, name: string }, productName: string, targetAudience: string, message: string) => {
    setError(null);

    if (!userService.hasCredits(CREDIT_SETTINGS.generation_cost)) {
        setError(`Saldo insuficiente. Custo: ${CREDIT_SETTINGS.generation_cost} crédito.`);
        return;
    }

    setIsLoading(true);
    setGeneratedCopy(null);

    const activeAI = adminService.getActiveGenerationModel();
    const aiConfig = { modelName: activeAI.modelId, temperature: activeAI.temperature };

    const cacheParams = { copyTypeId: copyType.id, productName, targetAudience, message, model: aiConfig.modelName };
    const cachedResult = appCache.get<GeneratedCopy>('copy', cacheParams);

    if (cachedResult) {
        setGeneratedCopy(cachedResult);
        setIsLoading(false);
        return;
    }

    try {
      const copyData = await generateMarketingCopy(copyType, productName, targetAudience, message, aiConfig);
      
      const success = creditService.deductCredits(CREDIT_SETTINGS.generation_cost, `Copy (${copyType.name}) com ${aiConfig.modelName}`);
      
      if (success) {
          appCache.set('copy', cacheParams, copyData);
          setGeneratedCopy(copyData);
      } else {
          setError('Erro ao debitar créditos.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred during copy generation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 xl:col-span-3">
        <CopyGeneratorForm
          isLoading={isLoading}
          onSubmit={handleGenerate}
        />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <CopyGeneratorDisplay
          data={generatedCopy}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default CopyGenerator;
