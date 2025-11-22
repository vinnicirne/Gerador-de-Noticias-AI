
import type { NewsTheme, AIConfig } from '../types';
import { generateNewsArticle, generateLandingPage, generateMarketingCopy, generateAdvancedPrompt, generateCanvaStructure } from './geminiService';
import { MOCK_THEMES, DEFAULT_AI_CONFIG, COPYWRITING_TYPES } from '../constants';
import { aiModelService } from './aiModelService';
import { historyService } from './historyService';
import { userService } from './userService';

interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  timestamp: string;
}

interface ApiRequest {
  endpoint: string;
  method: 'POST' | 'GET';
  apiKey: string;
  payload: any;
}

export const apiGateway = async (request: ApiRequest): Promise<ApiResponse<any>> => {
  // Simulação de latência de rede
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1. Validação de API Key (Simulada)
  if (!request.apiKey || !request.apiKey.startsWith('sk_gdn_')) {
    return {
      status: 401,
      error: 'Unauthorized: Invalid or missing API Key.',
      timestamp: new Date().toISOString()
    };
  }

  // 2. Roteamento de Endpoints
  try {
    switch (request.endpoint) {
      // Endpoints de Geração
      case '/api/v1/news/generate':
        return await handleNewsGeneration(request.payload);
      case '/api/v1/landing-page/generate':
        return await handleLandingPageGeneration(request.payload);
      case '/api/v1/copy/generate':
        return await handleCopyGeneration(request.payload);
      case '/api/v1/prompts/generate':
        return await handlePromptGeneration(request.payload);
      case '/api/v1/canva/structure':
        return await handleCanvaGeneration(request.payload);
      
      // Novos Endpoints de Sistema (Baseado em urls.py)
      case '/api/ai-models/':
        return await handleGetAIModels();
      case '/api/set-preferred-model/':
        return await handleSetPreferredModel(request.payload);
      case '/api/history/':
        return await handleGetHistory();

      default:
        return {
          status: 404,
          error: `Endpoint '${request.endpoint}' not found.`,
          timestamp: new Date().toISOString()
        };
    }
  } catch (error: any) {
    return {
      status: 500,
      error: error.message || 'Internal Server Error',
      timestamp: new Date().toISOString()
    };
  }
};

// Handlers Internos

const handleNewsGeneration = async (payload: any) => {
  if (!payload.themeId) throw new Error("Missing 'themeId' in payload.");
  
  const theme = MOCK_THEMES.find(t => t.id === payload.themeId);
  if (!theme) throw new Error(`Theme ID '${payload.themeId}' not found.`);

  // Determina modelo (payload ou preferido ou default)
  let config = { ...DEFAULT_AI_CONFIG };
  if (payload.modelId) {
      config.modelName = payload.modelId;
  } else {
      const pref = aiModelService.getUserPreferredModelId();
      if (pref) config.modelName = pref;
  }

  const result = await generateNewsArticle(
    theme,
    payload.customPrompt || '',
    payload.tone || 'Neutro',
    config
  );

  return {
    status: 200,
    data: result,
    timestamp: new Date().toISOString()
  };
};

const handleLandingPageGeneration = async (payload: any) => {
  if (!payload.productName || !payload.targetAudience) throw new Error("Missing required fields.");

  const result = await generateLandingPage(
    payload.productName,
    payload.targetAudience,
    payload.painPoints || '',
    payload.keyFeatures || '',
    DEFAULT_AI_CONFIG
  );

  return {
    status: 200,
    data: result,
    timestamp: new Date().toISOString()
  };
};

const handleCopyGeneration = async (payload: any) => {
  if (!payload.copyTypeId || !payload.productName) throw new Error("Missing required fields.");

  const copyType = COPYWRITING_TYPES.find(c => c.id === payload.copyTypeId);
  if (!copyType) throw new Error(`Copy Type ID '${payload.copyTypeId}' not found.`);

  const result = await generateMarketingCopy(
    copyType,
    payload.productName,
    payload.targetAudience || '',
    payload.message || '',
    DEFAULT_AI_CONFIG
  );

  return {
    status: 200,
    data: result,
    timestamp: new Date().toISOString()
  };
};

const handlePromptGeneration = async (payload: any) => {
  const result = await generateAdvancedPrompt(
    payload.platform || 'Midjourney',
    payload.category || 'Geral',
    payload.description || '',
    payload.style || '',
    DEFAULT_AI_CONFIG
  );

  return {
    status: 200,
    data: result,
    timestamp: new Date().toISOString()
  };
};

const handleCanvaGeneration = async (payload: any) => {
  const result = await generateCanvaStructure(
    payload.docType || 'Post Instagram',
    payload.subject || '',
    payload.style || '',
    DEFAULT_AI_CONFIG
  );

  return {
    status: 200,
    data: result,
    timestamp: new Date().toISOString()
  };
};

// Novos Handlers de Sistema

const handleGetAIModels = async () => {
    const models = aiModelService.getAvailableModels().map(m => ({
        id: m.id,
        name: m.name,
        model_id: m.modelId,
        platform: m.platformId, // Simplificado para demo
        context_length: m.contextLength
    }));

    return {
        status: 200,
        data: { models },
        timestamp: new Date().toISOString()
    };
};

const handleSetPreferredModel = async (payload: any) => {
    if (!payload.model_id) throw new Error("Missing 'model_id' in payload.");
    
    aiModelService.setUserPreferredModel(payload.model_id);
    
    return {
        status: 200,
        data: { success: true, message: `Preferred model updated to ${payload.model_id}` },
        timestamp: new Date().toISOString()
    };
};

const handleGetHistory = async () => {
    const history = historyService.get();
    return {
        status: 200,
        data: { 
            count: history.length,
            results: history.slice(0, 20) // Limit for API
        },
        timestamp: new Date().toISOString()
    };
};
