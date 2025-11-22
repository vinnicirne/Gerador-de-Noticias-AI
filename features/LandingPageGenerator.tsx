
import React, { useState, useCallback } from 'react';
import type { LandingPageData, AIModel } from '../types';
import { generateLandingPage } from '../services/geminiService';
import { appCache } from '../services/cacheService';
import { creditService } from '../services/creditService';
import { userService } from '../services/userService';
import { historyService } from '../services/historyService'; // NOVO
import { CREDIT_SETTINGS } from '../constants';
import LandingPageForm from '../components/LandingPageForm';
import LandingPageDisplay from '../components/LandingPageDisplay';

const LandingPageGenerator: React.FC = () => {
  const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (productName: string, targetAudience: string, painPoints: string, keyFeatures: string, model: AIModel | null) => {
    setError(null);
    
    if (!model) {
        setError('Nenhum modelo de IA foi selecionado ou está ativo.');
        return;
    }

    if (!productName || !targetAudience || !painPoints || !keyFeatures) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (!userService.hasCredits(CREDIT_SETTINGS.generation_cost)) {
        setError(`Saldo insuficiente. Custo: ${CREDIT_SETTINGS.generation_cost} crédito.`);
        return;
    }

    setIsLoading(true);
    setLandingPageData(null);

    const aiConfig = { modelName: model.modelId, temperature: 0.7 };

    const cacheParams = { productName, targetAudience, painPoints, keyFeatures, model: aiConfig.modelName };
    const cachedResult = appCache.get<LandingPageData>('landingPage', cacheParams);

    if (cachedResult) {
        setLandingPageData(cachedResult);
        setIsLoading(false);
        return;
    }

    try {
      const data = await generateLandingPage(productName, targetAudience, painPoints, keyFeatures, aiConfig);
      
      const success = creditService.deductCredits(CREDIT_SETTINGS.generation_cost, `Landing Page (${productName}) com ${aiConfig.modelName}`);
      
      if (success) {
          appCache.set('landingPage', cacheParams, data);
          setLandingPageData(data);
          historyService.add({
              generationType: 'landing_page',
              aiModel: model.name,
              promptSummary: `LP para "${productName}"`,
              inputs: { productName, targetAudience, painPoints, keyFeatures },
              result: data,
              creditsUsed: CREDIT_SETTINGS.generation_cost
          });
      } else {
          setError('Erro no débito de créditos.');
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
        <LandingPageForm isLoading={isLoading} onSubmit={handleGenerate} />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <LandingPageDisplay data={landingPageData} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default LandingPageGenerator;
