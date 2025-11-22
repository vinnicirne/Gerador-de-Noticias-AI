import React, { useState, useCallback } from 'react';
import type { GeneratedNews } from '../types';
import { generateNewsArticle } from '../services/geminiService';
import { appCache } from '../services/cacheService';
import { creditService } from '../services/creditService';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService'; // Importa adminService
import { CREDIT_SETTINGS } from '../constants';
import NewsGeneratorForm from '../components/NewsGeneratorForm';
import GeneratedNewsDisplay from '../components/GeneratedNewsDisplay';
import { MOCK_THEMES } from '../constants';

const NewsGenerator: React.FC = () => {
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNews = useCallback(async (themeId: string, customPrompt: string, tone: string) => {
    setError(null);

    if (!userService.hasCredits(CREDIT_SETTINGS.generation_cost)) {
        setError(`Saldo insuficiente. A geração custa ${CREDIT_SETTINGS.generation_cost} crédito.`);
        return;
    }

    setIsLoading(true);
    setGeneratedNews(null);

    const theme = MOCK_THEMES.find((t) => t.id === themeId);
    if (!theme) {
      setError('Selected theme not found.');
      setIsLoading(false);
      return;
    }
    
    // Busca o modelo ativo configurado no admin
    const activeAI = adminService.getActiveGenerationModel();
    const aiConfig = { modelName: activeAI.modelId, temperature: activeAI.temperature };

    const cacheParams = { themeId, customPrompt, tone, model: aiConfig.modelName };
    const cachedResult = appCache.get<GeneratedNews>('news', cacheParams);

    if (cachedResult) {
        setGeneratedNews(cachedResult);
        setIsLoading(false);
        return;
    }

    try {
      // Passa a configuração de IA dinâmica para a função de geração
      const newsData = await generateNewsArticle(theme, customPrompt, tone, aiConfig);
      
      const success = creditService.deductCredits(CREDIT_SETTINGS.generation_cost, `Notícia (${theme.name}) com ${aiConfig.modelName}`);
      
      if (success) {
          appCache.set('news', cacheParams, newsData);
          setGeneratedNews(newsData);
      } else {
          setError('Falha ao processar créditos.');
      }

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred during news generation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 xl:col-span-3">
        <NewsGeneratorForm
          themes={MOCK_THEMES}
          isLoading={isLoading}
          onSubmit={handleGenerateNews}
        />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <GeneratedNewsDisplay
          news={generatedNews}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default NewsGenerator;
