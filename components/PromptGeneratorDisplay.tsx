
import React from 'react';
import type { GeneratedPrompt } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyableField from './CopyableField';

interface PromptGeneratorDisplayProps {
  data: GeneratedPrompt | null;
  isLoading: boolean;
  error: string | null;
}


const PromptGeneratorDisplay: React.FC<PromptGeneratorDisplayProps> = ({ data, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-900/20 p-8 rounded-xl min-h-[400px]">
        <LoadingSpinner className="h-10 w-10 text-[#1b8a0f]"/>
        <p className="mt-4 text-gray-400">Criando seu prompt avançado...</p>
        <p className="text-sm text-gray-500">A IA está fazendo a engenharia reversa da sua criatividade.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg" role="alert">
        <div className="flex">
          <div className="py-1">
            <svg className="h-6 w-6 text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-red-400">Erro na Geração</p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-gray-900/20 p-8 rounded-xl min-h-[400px]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#1b8a0f] mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Pronto para inspirar a IA?</h3>
        <p className="mt-2 max-w-md text-gray-400">
          Descreva sua ideia, escolha a plataforma e a categoria, e a IA criará um prompt detalhado e profissional para você.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-[#136c0b]/30 p-6 sm:p-8 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.4)] animate-fade-in space-y-8 relative">
       {data.isFromCache && (
            <span className="absolute top-4 right-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800">
                Carregado do cache
            </span>
        )}
       <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#1b8a0f] border-l-4 border-[#1b8a0f] pl-3 m-0">Prompt Gerado</h2>
                <div className="flex items-center gap-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                        {data.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#136c0b]/20 text-[#1b8a0f]">
                        {data.platform}
                    </span>
                </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">{data.prompt}</p>
            </div>
             <CopyableField label="" value={data.prompt} />
              <button
                onClick={() => navigator.clipboard.writeText(data.prompt)}
                className="w-full mt-6 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Prompt
            </button>
       </div>


      <div className="text-xs text-gray-600 pt-4 border-t border-[#136c0b]/30 text-center">
        Gerado em {data.generatedAt.toLocaleString()} usando {data.modelUsed}.
      </div>
    </div>
  );
};

export default PromptGeneratorDisplay;
