
import React, { useState, useCallback } from 'react';
import type { GeneratedPrompt, AIModel } from '../types';
import { generateAdvancedPrompt } from '../services/geminiService';
import { appCache } from '../services/cacheService';
import { creditService } from '../services/creditService';
import { userService } from '../services/userService';
import { historyService } from '../services/historyService'; // NOVO
import { CREDIT_SETTINGS } from '../constants';
import PromptGeneratorForm from '../components/PromptGeneratorForm';
import PromptGeneratorDisplay from '../components/PromptGeneratorDisplay';

const PromptGenerator: React.FC = () => {
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (platform: string, category: string, description: string, style: string, model: AIModel | null) => {
    setError(null);

    if (!model) {
        setError('Nenhum modelo de IA foi selecionado ou está ativo.');
        return;
    }

    if (!userService.hasCredits(CREDIT_SETTINGS.generation_cost)) {
        setError(`Saldo insuficiente. Custo: ${CREDIT_SETTINGS.generation_cost} crédito.`);
        return;
    }

    setIsLoading(true);
    setGeneratedPrompt(null);
    
    const aiConfig = { modelName: model.modelId, temperature: 0.7 };

    const cacheParams = { platform, category, description, style, model: aiConfig.modelName };
    const cachedResult = appCache.get<GeneratedPrompt>('prompt', cacheParams);

    if (cachedResult) {
        setGeneratedPrompt(cachedResult);
        setIsLoading(false);
        return;
    }

    try {
      const promptData = await generateAdvancedPrompt(platform, category, description, style, aiConfig);
      
      const success = creditService.deductCredits(CREDIT_SETTINGS.generation_cost, `Prompt (${category}) com ${aiConfig.modelName}`);

      if (success) {
          appCache.set('prompt', cacheParams, promptData);
          setGeneratedPrompt(promptData);
           historyService.add({
              generationType: 'prompt',
              aiModel: model.name,
              promptSummary: `${platform} - ${category}`,
              inputs: { platform, category, description, style },
              result: promptData,
              creditsUsed: CREDIT_SETTINGS.generation_cost
          });
      } else {
          setError('Erro no débito de créditos.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred during prompt generation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 xl:col-span-3">
        <PromptGeneratorForm
          isLoading={isLoading}
          onSubmit={handleGenerate}
        />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <PromptGeneratorDisplay
          data={generatedPrompt}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default PromptGenerator;
