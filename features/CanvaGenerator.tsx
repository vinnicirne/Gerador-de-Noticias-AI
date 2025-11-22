
import React, { useState, useCallback } from 'react';
import type { GeneratedCanvaStructure, AIModel } from '../types';
import { generateCanvaStructure } from '../services/geminiService';
import { appCache } from '../services/cacheService';
import { creditService } from '../services/creditService';
import { userService } from '../services/userService';
import { historyService } from '../services/historyService'; // NOVO
import { CREDIT_SETTINGS } from '../constants';
import CanvaGeneratorForm from '../components/CanvaGeneratorForm';
import CanvaGeneratorDisplay from '../components/CanvaGeneratorDisplay';

const CanvaGenerator: React.FC = () => {
  const [generatedStructure, setGeneratedStructure] = useState<GeneratedCanvaStructure | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (docType: string, subject: string, style: string, model: AIModel | null) => {
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
    setGeneratedStructure(null);

    const aiConfig = { modelName: model.modelId, temperature: 0.7 };

    const cacheParams = { docType, subject, style, model: aiConfig.modelName };
    const cachedResult = appCache.get<GeneratedCanvaStructure>('canva', cacheParams);

    if (cachedResult) {
        setGeneratedStructure(cachedResult);
        setIsLoading(false);
        return;
    }

    try {
      const data = await generateCanvaStructure(docType, subject, style, aiConfig);
      
      const success = creditService.deductCredits(CREDIT_SETTINGS.generation_cost, `Canva (${docType}) com ${aiConfig.modelName}`);

      if (success) {
          appCache.set('canva', cacheParams, data);
          setGeneratedStructure(data);
          historyService.add({
              generationType: 'canva',
              aiModel: model.name,
              promptSummary: `${docType} sobre "${subject.substring(0, 30)}..."`,
              inputs: { docType, subject, style },
              result: data,
              creditsUsed: CREDIT_SETTINGS.generation_cost
          });
      } else {
          setError('Erro ao debitar créditos.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 xl:col-span-3">
        <CanvaGeneratorForm
          isLoading={isLoading}
          onSubmit={handleGenerate}
        />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <CanvaGeneratorDisplay
          data={generatedStructure}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default CanvaGenerator;
