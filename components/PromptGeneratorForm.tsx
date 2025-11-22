
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import CharacterCounter from './CharacterCounter';
import { PROMPT_PLATFORMS, PROMPT_CATEGORIES } from '../constants';
import AIModelSelector from './AIModelSelector';
import { AIModel } from '../types';

interface PromptGeneratorFormProps {
  isLoading: boolean;
  onSubmit: (platform: string, category: string, description: string, style: string, model: AIModel | null) => void;
}

const MAX_LENGTHS = {
    description: 1000,
    style: 500,
};

const PromptGeneratorForm: React.FC<PromptGeneratorFormProps> = ({ isLoading, onSubmit }) => {
  const [platform, setPlatform] = useState<string>(PROMPT_PLATFORMS[0]);
  const [category, setCategory] = useState<string>(PROMPT_CATEGORIES[0]);
  const [description, setDescription] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && description) {
      onSubmit(platform, category, description, style, selectedModel);
    }
  };

  return (
    <div className="bg-gray-900/20 p-6 rounded-xl border border-[#136c0b]/30 shadow-[0_0_10px_rgba(27,138,15,0.4)] sticky top-0">
      <h2 className="text-lg font-semibold text-[#1b8a0f] mb-4">Gerador de Prompts</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <AIModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} disabled={isLoading} />
        
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-500 mb-1">
            Plataforma de IA
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#136c0b]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] sm:text-sm rounded-md bg-black text-gray-300 transition-all duration-200"
            disabled={isLoading}
          >
            {PROMPT_PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-black text-gray-300">
                {p}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-500 mb-1">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#136c0b]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] sm:text-sm rounded-md bg-black text-gray-300 transition-all duration-200"
            disabled={isLoading}
          >
            {PROMPT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-black text-gray-300">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="description" className="block text-sm font-medium text-gray-500 mb-1">
              Descrição Principal da Ideia
            </label>
             <CharacterCounter count={description.length} maxLength={MAX_LENGTHS.description} />
          </div>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_LENGTHS.description}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Um astronauta flutuando no espaço, olhando para uma nebulosa colorida em formato de leão..."
            disabled={isLoading}
            required
          />
        </div>

        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="style" className="block text-sm font-medium text-gray-500 mb-1">
              Estilos e Parâmetros (Opcional)
            </label>
            <CharacterCounter count={style.length} maxLength={MAX_LENGTHS.style} />
          </div>
          <textarea
            id="style"
            rows={3}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            maxLength={MAX_LENGTHS.style}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Estilo cyberpunk, neon, fotorrealista, --ar 16:9..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedModel}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner className="h-5 w-5 -ml-1 mr-3 text-white" /> : 'Gerar Prompt'}
        </button>
      </form>
    </div>
  );
};

export default PromptGeneratorForm;
