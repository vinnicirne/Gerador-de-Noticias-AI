import React, { useState, useCallback } from 'react';
import type { GeneratedCopy, AIModel } from '../types';
import { generateMarketingCopy } from '../services/geminiService';
import { appCache } from '../services/cacheService';
import { userService } from '../services/userService';
import { historyService } from '../services/historyService';
import { PlanMiddleware } from '../services/planMiddleware'; // NOVO
import CopyGeneratorForm from '../components/CopyGeneratorForm';
import CopyGeneratorDisplay from '../components/CopyGeneratorDisplay';

const CopyGenerator: React.FC = () => {
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = userService.getUser();

  const handleGenerate = useCallback(async (copyType: { id: string, name: string }, productName: string, targetAudience: string, message: string, model: AIModel | null) => {
    setError(null);
    
    if (!model) {
        setError('Nenhum modelo de IA foi selecionado ou está ativo.');
        return;
    }

    const check = await PlanMiddleware.canGenerate(user.id, model.modelId);
    if (!check.allowed) {
        setError(check.reason);
        return;
    }

    setIsLoading(true);
    setGeneratedCopy(null);

    const aiConfig = { modelName: model.modelId, temperature: 0.7 };

    const cacheParams = { copyTypeId: copyType.id, productName, targetAudience, message, model: aiConfig.modelName };
    const cachedResult = appCache.get<GeneratedCopy>('copy', cacheParams);

    if (cachedResult) {
        setGeneratedCopy(cachedResult);
        setIsLoading(false);
        return;
    }

    try {
      const copyData = await generateMarketingCopy(copyType, productName, targetAudience, message, aiConfig);
      
      userService.recordGeneration();
      
      appCache.set('copy', cacheParams, copyData);
      setGeneratedCopy(copyData);
      historyService.add({
          generationType: 'copy',
          aiModel: model.name,
          promptSummary: `${copyType.name} para "${productName}"`,
          inputs: { copyType: copyType.name, productName, targetAudience, message },
          result: copyData,
          creditsUsed: 1
      });
      
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred during copy generation.');
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

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
