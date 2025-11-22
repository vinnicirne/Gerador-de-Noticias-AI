
import React from 'react';
import type { GeneratedCanvaStructure } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyableField from './CopyableField';

interface CanvaGeneratorDisplayProps {
  data: GeneratedCanvaStructure | null;
  isLoading: boolean;
  error: string | null;
}

const CanvaGeneratorDisplay: React.FC<CanvaGeneratorDisplayProps> = ({ data, isLoading, error }) => {

  const renderContent = (content: string) => {
      const sections = content.split('## ').filter(Boolean);
      
      return sections.map((section, index) => {
          const [title, ...lines] = section.split('\n');
          
          if (title.trim().startsWith('Paleta de Cores')) {
               return (
                  <div key={index} className="mb-8">
                       <h3 className="text-xl font-bold text-[#1b8a0f] mb-4 border-b border-[#136c0b]/30 pb-2">{title.trim()}</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {lines.filter(l => l.trim().startsWith('- **')).map((line, i) => {
                               const colorMatch = line.match(/\[(.*?)\]/);
                               const hex = colorMatch ? colorMatch[1] : '#000000';
                               const name = line.split('] - ')[1] || 'Cor';
                               const label = line.split('**')[1];
                               
                               return (
                                   <div key={i} className="flex items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                                       <div className="w-12 h-12 rounded-full border-2 border-white/20 shadow-sm mr-4" style={{ backgroundColor: hex }}></div>
                                       <div>
                                           <p className="text-xs text-gray-500 font-bold uppercase">{label}</p>
                                           <p className="text-white font-mono text-sm">{hex}</p>
                                           <p className="text-xs text-gray-400">{name}</p>
                                       </div>
                                       <button 
                                            onClick={() => navigator.clipboard.writeText(hex)}
                                            className="ml-auto text-gray-500 hover:text-[#1b8a0f]"
                                            title="Copiar HEX"
                                        >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                       </button>
                                   </div>
                               )
                           })}
                       </div>
                  </div>
               )
          }

          return (
              <div key={index} className="mb-8">
                  <h3 className="text-xl font-bold text-[#1b8a0f] mb-4 border-b border-[#136c0b]/30 pb-2">{title.trim()}</h3>
                  <div className="space-y-4">
                      {lines.filter(l => l.trim()).map((line, i) => {
                          if (line.trim().startsWith('**') || line.trim().startsWith('- **')) {
                               const cleanLine = line.replace(/^- /, '');
                               const parts = cleanLine.split('**');
                               const label = parts[1];
                               const text = parts[2]?.replace(/^:/, '').trim();

                               if (text) {
                                   return <CopyableField key={i} label={label} value={text} />
                               }
                               return <p key={i} className="text-gray-300 ml-4">{cleanLine.replace(/\*\*/g, '')}</p>
                          }
                          return <p key={i} className="text-gray-300 leading-relaxed">{line}</p>
                      })}
                  </div>
              </div>
          )
      });
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-900/20 p-8 rounded-xl min-h-[400px]">
        <LoadingSpinner className="h-10 w-10 text-[#1b8a0f]"/>
        <p className="mt-4 text-gray-400">Criando estrutura visual...</p>
        <p className="text-sm text-gray-500">A IA está definindo cores, textos e layout.</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Design sem bloqueio criativo</h3>
        <p className="mt-2 max-w-md text-gray-400">
          Defina o assunto e o estilo, e receba uma "receita" pronta para montar sua arte no Canva: textos, cores e composição.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-[#136c0b]/30 p-6 sm:p-8 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.4)] animate-fade-in relative">
       {data.isFromCache && (
            <span className="absolute top-4 right-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800">
                Carregado do cache
            </span>
        )}
       
       <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#136c0b]/30">
            <h2 className="text-2xl font-bold text-white">Estrutura para Canva</h2>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#136c0b]/20 text-[#1b8a0f]">
                {data.docType}
            </span>
       </div>

      <div className="space-y-6">
          {renderContent(data.content)}
      </div>

      <div className="text-xs text-gray-600 mt-8 pt-4 border-t border-[#136c0b]/30 text-center">
        Gerado em {data.generatedAt.toLocaleString()} usando {data.modelUsed}.
      </div>
    </div>
  );
};

export default CanvaGeneratorDisplay;
