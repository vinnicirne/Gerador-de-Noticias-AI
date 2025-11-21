
import React from 'react';
import { NEWS_THEMES, NEWS_TONES } from '../constants';

interface NewsGeneratorFormProps {
  theme: string;
  setTheme: (theme: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const NewsGeneratorForm: React.FC<NewsGeneratorFormProps> = ({
  theme,
  setTheme,
  topic,
  setTopic,
  tone,
  setTone,
  onSubmit,
  isLoading,
}) => {

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-400 mb-1">
                Tema da Notícia
              </label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-black border border-green-900/60 text-gray-200 rounded-md p-2.5 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 outline-none"
              >
                {NEWS_THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-400 mb-1">
                Tom de Voz
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-black border border-green-900/60 text-green-100 rounded-md p-2.5 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 outline-none"
              >
                {NEWS_TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1">
            Tópico Específico (Opcional)
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Lançamento do novo iPhone, final da Champions League..."
            className="w-full bg-black border border-green-900/60 text-gray-200 rounded-md p-2.5 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 outline-none placeholder-gray-700"
          />
        </div>
      </form>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded-md hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] border border-green-500"
      >
        {isLoading ? 'Processando Dados...' : 'Inicializar Geração'}
      </button>
    </div>
  );
};

export default NewsGeneratorForm;
