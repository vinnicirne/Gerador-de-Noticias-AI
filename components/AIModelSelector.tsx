
import React, { useState, useEffect } from 'react';
import { aiModelService } from '../services/aiModelService';
import { AIModel, AIPlatform } from '../types';
import { adminService } from '../services/adminService';

interface AIModelSelectorProps {
    selectedModel: AIModel | null;
    onModelChange: (model: AIModel | null) => void;
    disabled?: boolean;
    label?: string;
    showHelpText?: boolean;
    autoSave?: boolean;
}

const AIModelSelector: React.FC<AIModelSelectorProps> = ({ 
    selectedModel, 
    onModelChange, 
    disabled,
    label = "Modelo de IA",
    showHelpText = false,
    autoSave = false
}) => {
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
    const [platforms, setPlatforms] = useState<AIPlatform[]>([]);
    
    useEffect(() => {
        const activeModels = aiModelService.getAvailableModels();
        const allPlatforms = adminService.getAIPlatforms();
        
        setAvailableModels(activeModels);
        setPlatforms(allPlatforms);
        
        // Auto-select logic if nothing is selected
        if (!selectedModel && activeModels.length > 0) {
            const preferredModelId = aiModelService.getUserPreferredModelId();
            const preferredModel = activeModels.find(m => m.modelId === preferredModelId);
            
            if (preferredModel) {
                onModelChange(preferredModel);
            } else {
                onModelChange(activeModels[0]);
            }
        }
    }, [selectedModel, onModelChange]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const model = availableModels.find(m => m.id === e.target.value) || null;
        onModelChange(model);

        // Lógica de Auto-Save (semelhante ao AJAX do template)
        if (autoSave && model) {
            aiModelService.setUserPreferredModel(model.modelId);
        }
    };

    const getPlatformForModel = (model: AIModel) => {
        return platforms.find(p => p.id === model.platformId);
    };

    return (
        <div className="mb-3">
            <label htmlFor="ai-model-selector" className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {label}
            </label>
            <select
                id="ai-model-selector"
                value={selectedModel?.id || ''}
                onChange={handleSelectChange}
                disabled={disabled || availableModels.length === 0}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#136c0b]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] sm:text-sm rounded-md bg-black text-gray-300 transition-all duration-200 disabled:bg-gray-800 disabled:text-gray-500"
            >
                {availableModels.length === 0 && <option>Nenhum modelo ativo</option>}
                {availableModels.map(model => (
                    <option key={model.id} value={model.id} className="bg-black text-gray-300">
                        {model.name} ({getPlatformForModel(model)?.displayName})
                    </option>
                ))}
            </select>
            
            {showHelpText && (
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    O modelo selecionado será salvo como sua preferência
                </div>
            )}
        </div>
    );
};

export default AIModelSelector;
