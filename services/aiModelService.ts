import { adminService } from './adminService';
import { userService } from './userService';
import { AIModel } from '../types';

/**
 * Service dedicado para gerenciar a lógica de negócio dos modelos de IA.
 * Ele atua como o controller/service layer para todas as operações relacionadas a modelos.
 */
class AIModelService {
    /**
     * Retorna todos os modelos de IA que estão ativos, tanto o modelo quanto sua plataforma.
     */
    public getAvailableModels(): AIModel[] {
        const activePlatforms = adminService.getAIPlatforms().filter(p => p.isActive).map(p => p.id);
        const allModels = adminService.getAIModels();
        
        return allModels.filter(model => 
            model.isActive && activePlatforms.includes(model.platformId)
        );
    }

    /**
     * Retorna o ID do modelo preferido do usuário.
     */
    public getUserPreferredModelId(): string | undefined {
        return userService.getPreferredModel();
    }
    
    /**
     * Define o modelo preferido do usuário.
     * @param modelId O `modelId` (ex: "gemini-3-pro-preview") a ser salvo.
     */
    public setUserPreferredModel(modelId: string): void {
        const availableModels = this.getAvailableModels();
        // We can receive either the unique ID ('mod_gem_pro') or the modelId ('gemini-3-pro-preview')
        const model = availableModels.find(m => m.id === modelId || m.modelId === modelId);
        
        if (model) {
            // Always save the 'modelId' for consistency with API calls
            userService.setPreferredModel(model.modelId);
        } else {
            console.error(`Attempted to set an invalid or inactive preferred model: ${modelId}`);
        }
    }
}

export const aiModelService = new AIModelService();