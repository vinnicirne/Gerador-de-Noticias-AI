
import React, { useState } from 'react';
import type { NewsTheme, AIModel } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { NEWS_TONES } from '../constants';
import CharacterCounter from './CharacterCounter';
import AIModelSelector from './AIModelSelector'; // NOVO

interface NewsGeneratorFormProps {
  themes: NewsTheme[];
  isLoading: boolean;
  onSubmit: (themeId: string, customPrompt: string, tone: string, model: AIModel | null) => void;
}

const MAX_PROMPT_LENGTH = 500;

const NewsGeneratorForm: React.FC<NewsGeneratorFormProps> = ({ themes, isLoading, onSubmit }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(themes[0]?.id || '');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>(NEWS_TONES[0]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null); // NOVO


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedThemeId && !isLoading) {
      onSubmit(selectedThemeId, customPrompt, selectedTone, selectedModel);
    }
  };

  return (
    <div className="bg-gray-900/20 p-6 rounded-xl border border-[#136c0b]/30 shadow-[0_0_10px_rgba(27,138,15,0.4)] sticky top-0">
      <h2 className="text-lg font-semibold text-[#1b8a0f] mb-4">Gerador de Notícias</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* NOVO: Seletor de Modelo */}
        <AIModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} disabled={isLoading} />
        
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-500 mb-1">
            Escolha um Tema
          </label>
          <select
            id="theme"
            name="theme"
            value={selectedThemeId}
            onChange={(e) => setSelectedThemeId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#136c0b]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] sm:text-sm rounded-md bg-black text-gray-300 transition-all duration-200"
            disabled={isLoading}
          >
            {themes.filter(t => t.is_active).map((theme) => (
              <option key={theme.id} value={theme.id} className="bg-black text-gray-300">
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <div>
           <label htmlFor="tone" className="block text-sm font-medium text-gray-500 mb-1">
            Tom da Notícia
          </label>
          <select
            id="tone"
            name="tone"
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#136c0b]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] sm:text-sm rounded-md bg-black text-gray-300 transition-all duration-200"
            disabled={isLoading}
          >
            {NEWS_TONES.map((tone) => (
              <option key={tone} value={tone} className="bg-black text-gray-300">
                {tone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="custom_prompt" className="block text-sm font-medium text-gray-500 mb-1">
              Prompt Customizado (Opcional)
            </label>
             <CharacterCounter count={customPrompt.length} maxLength={MAX_PROMPT_LENGTH} />
          </div>
          <textarea
            id="custom_prompt"
            name="custom_prompt"
            rows={4}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            maxLength={MAX_PROMPT_LENGTH}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Foco em startups de IA no Brasil..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedModel}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner className="h-5 w-5 -ml-1 mr-3 text-white" /> : 'Gerar Notícia'}
        </button>
      </form>
    </div>
  );
};

export default NewsGeneratorForm;
