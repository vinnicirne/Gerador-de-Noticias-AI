import React, { useState, useCallback } from 'react';
import type { GeneratedNews, AIModel } from '../types';
import { generateNewsArticle } from '../services/geminiService';
import { appCache } from '../services/cacheService';
import { userService } from '../services/userService';
import { historyService } from '../services/historyService';
import { PlanMiddleware } from '../services/planMiddleware'; // NOVO
import NewsGeneratorForm from '../components/NewsGeneratorForm';
import GeneratedNewsDisplay from '../components/GeneratedNewsDisplay';
import { MOCK_THEMES } from '../constants';

const NewsGenerator: React.FC = () => {
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = userService.getUser();

  const handleGenerateNews = useCallback(async (themeId: string, customPrompt: string, tone: string, model: AIModel | null) => {
    setError(null);

    if (!model) {
        setError('Nenhum modelo de IA foi selecionado ou está ativo.');
        return;
    }
    
    // VERIFICAÇÃO DE PLANO (Middleware)
    const check = await PlanMiddleware.canGenerate(user.id, model.modelId);
    if (!check.allowed) {
        setError(check.reason);
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
    
    const aiConfig = { modelName: model.modelId, temperature: 0.7 };

    const cacheParams = { themeId, customPrompt, tone, model: aiConfig.modelName };
    const cachedResult = appCache.get<GeneratedNews>('news', cacheParams);

    if (cachedResult) {
        setGeneratedNews(cachedResult);
        setIsLoading(false);
        return;
    }

    try {
      const newsData = await generateNewsArticle(theme, customPrompt, tone, aiConfig);
      
      userService.recordGeneration(); // Registra o uso
      
      appCache.set('news', cacheParams, newsData);
      setGeneratedNews(newsData);
      
      historyService.add({
          generationType: 'news',
          aiModel: model.name,
          promptSummary: `${theme.name} - ${customPrompt.substring(0, 30)}...`,
          inputs: { theme: theme.name, tone, customPrompt },
          result: newsData,
          creditsUsed: 1 // Custo padrão
      });

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred during news generation.');
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

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
