
import React, { useState } from 'react';
import type { GeneratedCopy } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyableField from './CopyableField';
import SEOPreview from './SEOPreview';
import QualityScoreCard from './QualityScoreCard';

interface CopyGeneratorDisplayProps {
  data: GeneratedCopy | null;
  isLoading: boolean;
  error: string | null;
}

const SEOBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
        {children}
    </span>
);

const CopyGeneratorDisplay: React.FC<CopyGeneratorDisplayProps> = ({ data, isLoading, error }) => {
  const [allSeoCopied, setAllSeoCopied] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'markdown'>('visual');

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      line = line.trim();
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-[#1b8a0f]">{line.substring(4)}</h3>;
      }
       if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-white">{line.substring(3)}</h2>;
      }
      if (line === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-4 text-gray-300 leading-relaxed">{line}</p>;
    });
  };

  const handleCopyAllSEO = () => {
      if (!data) return;
      const seoDataText = `
TÍTULO SEO: ${data.seo.title}
DESCRIÇÃO SEO: ${data.seo.description}
SLUG URL: ${data.seo.slug}
PALAVRA-CHAVE PRIMÁRIA: ${data.seo.primaryKeyword}
PALAVRAS-CHAVE SECUNDÁRIAS: ${data.seo.secondaryKeywords.join(', ')}
FOCO SEO: ${data.seo.seoFocus}
DIFICULDADE: ${data.seo.keywordDifficulty}
SCHEMA: ${data.seo.schemaType}
      `.trim();
      
      navigator.clipboard.writeText(seoDataText);
      setAllSeoCopied(true);
      setTimeout(() => setAllSeoCopied(false), 2000);
  };

  const handleCopyContent = () => {
      if (!data) return;
      navigator.clipboard.writeText(data.content);
      setContentCopied(true);
      setTimeout(() => setContentCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-900/20 p-8 rounded-xl min-h-[400px]">
        <LoadingSpinner className="h-10 w-10 text-[#1b8a0f]"/>
        <p className="mt-4 text-gray-400">Gerando copy e verificando originalidade...</p>
        <p className="text-sm text-gray-500">A IA está criando textos que vendem.</p>
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
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Pronto para persuadir?</h3>
        <p className="mt-2 max-w-md text-gray-400">
          Selecione um tipo de copy, descreva seu produto e deixe a IA criar textos de marketing que geram resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
        
        {/* Header & Preview */}
        <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)] relative">
            {data.isFromCache && (
                <span className="absolute top-4 right-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800">
                    Carregado do cache
                </span>
            )}
            <SEOPreview 
                title={data.seo.title}
                slug={data.seo.slug}
                description={data.seo.description}
            />
            <div className="mt-6">
                 <QualityScoreCard metrics={data.validation} />
            </div>
        </div>

        {/* SEO Section */}
        <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-[#1b8a0f] flex items-center gap-2">
                    🚀 Metadados SEO - Rank Math
                </h2>
                <button 
                    onClick={handleCopyAllSEO}
                    className="flex items-center gap-2 px-4 py-2 bg-green-900/20 text-green-400 border border-green-900/50 rounded-md hover:bg-green-900/40 transition-colors text-sm font-medium"
                >
                     {allSeoCopied ? '✅ Copiado!' : '📋 Copiar Pacote SEO'}
                </button>
            </div>
             <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                     <CopyableField label="Título SEO" value={data.seo.title} maxChars={60} />
                     <CopyableField label="Descrição SEO" value={data.seo.description} maxChars={160} />
                     <CopyableField label="Slug URL" value={data.seo.slug} isMono />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CopyableField label="Palavra-Chave Primária" value={data.seo.primaryKeyword} />
                    <CopyableField label="Foco SEO" value={data.seo.seoFocus} />
                </div>
                 <CopyableField label="Palavras-Chave Secundárias" value={data.seo.secondaryKeywords.join(', ')} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase block mb-1">Dificuldade</span>
                        <SEOBadge>{data.seo.keywordDifficulty}</SEOBadge>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                         <span className="text-[10px] text-gray-500 uppercase block mb-1">Schema</span>
                        <SEOBadge>{data.seo.schemaType}</SEOBadge>
                    </div>
                </div>
            </div>
        </div>

      {/* Content Section */}
      <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-800 pb-4 gap-4">
             <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    📝 Conteúdo da Copy
                </h2>
                <span className="text-xs text-gray-500 mt-1 block">
                   Tipo: {data.copyType}
                </span>
            </div>
             <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1 border border-gray-800">
                <button
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        viewMode === 'visual' 
                        ? 'bg-[#1b8a0f] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    👁️ Visual
                </button>
                <button
                    onClick={() => setViewMode('markdown')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        viewMode === 'markdown' 
                        ? 'bg-[#1b8a0f] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    📝 Markdown
                </button>
            </div>
        </div>

        {viewMode === 'visual' ? (
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              {renderContent(data.content)}
            </div>
        ) : (
             <div className="relative mt-4">
                <textarea 
                    readOnly 
                    className="w-full h-96 bg-gray-900 p-4 rounded-lg border border-gray-800 text-gray-300 font-mono text-sm focus:ring-2 focus:ring-[#1b8a0f] focus:border-transparent focus:outline-none resize-y"
                    value={data.content}
                />
                 <button 
                 onClick={handleCopyContent}
                 className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 text-gray-300 border border-gray-600 rounded hover:bg-black transition-colors text-xs backdrop-blur-sm"
                >
                    {contentCopied ? '✅ Copiado!' : '📋 Copiar Texto'}
                </button>
            </div>
        )}

         {viewMode === 'visual' && (
            <div className="mt-4 flex justify-end">
                <button 
                     onClick={handleCopyContent}
                     className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                    {contentCopied ? '✅ Copiado!' : '📋 Copiar Texto'}
                </button>
            </div>
        )}

         <div className="text-xs text-gray-600 mt-4 text-center">
           Modelo: {data.modelUsed}
        </div>
      </div>
    </div>
  );
};

export default CopyGeneratorDisplay;
