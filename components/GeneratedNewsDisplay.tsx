
import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedNews, SEOAnalysisReport } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyableField from './CopyableField';
import SEOPreview from './SEOPreview';
import QualityScoreCard from './QualityScoreCard';
import SEOAnalysisCard from './SEOAnalysisCard';
import VisualEditorToolbar from './VisualEditorToolbar';
import { notificationService } from '../services/notificationService';
import { integrationService } from '../services/integrationService';
import { seoAnalyzer } from '../services/seoAnalyzer';

interface GeneratedNewsDisplayProps {
  news: GeneratedNews | null;
  isLoading: boolean;
  error: string | null;
}

const SEOBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
        {children}
    </span>
);

const GeneratedNewsDisplay: React.FC<GeneratedNewsDisplayProps> = ({ news, isLoading, error }) => {
    const [allSeoCopied, setAllSeoCopied] = useState(false);
    const [contentCopied, setContentCopied] = useState(false);
    const [viewMode, setViewMode] = useState<'visual' | 'markdown'>('visual');
    const [isPublishing, setIsPublishing] = useState(false);
    const [seoReport, setSeoReport] = useState<SEOAnalysisReport | null>(null);
    const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
    const contentEditableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (news) {
            notificationService.notify('Notícia gerada e otimizada com sucesso!', 'success');
            // Run technical SEO Analysis
            const report = seoAnalyzer.analyze(news.content, news.seo);
            setSeoReport(report);
            setFeedbackGiven(null); // Reset feedback on new generation
        }
    }, [news]);

    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (contentEditableRef.current) {
            contentEditableRef.current.focus();
        }
    };

    const handleFeedback = (rating: 'up' | 'down') => {
        if (!news || feedbackGiven) return;
        integrationService.logFeedback('news', rating, news.theme.name);
        setFeedbackGiven(rating);
    };

  const handleCopyAllSEO = () => {
      if (!news) return;
      const seoDataText = `
TÍTULO SEO: ${news.seo.title}
DESCRIÇÃO SEO: ${news.seo.description}
SLUG URL: ${news.seo.slug}
PALAVRA-CHAVE PRIMÁRIA: ${news.seo.primaryKeyword}
PALAVRAS-CHAVE SECUNDÁRIAS: ${news.seo.secondaryKeywords.join(', ')}
FOCO SEO: ${news.seo.seoFocus}
DIFICULDADE: ${news.seo.keywordDifficulty}
SCHEMA: ${news.seo.schemaType}
      `.trim();
      
      navigator.clipboard.writeText(seoDataText);
      setAllSeoCopied(true);
      setTimeout(() => setAllSeoCopied(false), 2000);
      notificationService.notify('Metadados SEO copiados para a área de transferência!', 'info');
  };

  const handleCopyContent = () => {
      if (!news) return;
      navigator.clipboard.writeText(news.content);
      setContentCopied(true);
      setTimeout(() => setContentCopied(false), 2000);
      notificationService.notify('Conteúdo copiado com sucesso!', 'info');
  };

  const handlePublishWP = async () => {
      if (!news) return;
      
      const config = integrationService.getConfig();
      if (!config.wordpress?.connected) {
          notificationService.notify('WordPress não conectado. Vá em Configurações > Integrações.', 'error');
          return;
      }

      setIsPublishing(true);
      try {
          const url = await integrationService.publishToWordPress(news);
          notificationService.notify(`Publicado com sucesso! ${url}`, 'success');
      } catch (e: any) {
          notificationService.notify(e.message || 'Erro ao publicar', 'error');
      } finally {
          setIsPublishing(false);
      }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-900/20 p-8 rounded-xl min-h-[400px]">
        <LoadingSpinner className="h-10 w-10 text-[#1b8a0f]"/>
        <p className="mt-4 text-gray-400">Gerando sua notícia otimizada...</p>
        <p className="text-sm text-gray-500">A IA está criando, auditando e gerando assets visuais.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg" role="alert">
        <p className="font-bold text-red-400">Erro na Geração</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-gray-900/20 p-8 rounded-xl min-h-[400px]">
         <h3 className="text-xl font-semibold text-white">Pronto para criar?</h3>
         <p className="text-gray-400">Selecione um tema e clique em Gerar Notícia.</p>
      </div>
    );
  }

  const renderHTML = (markdown: string) => {
      return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/\n/gim, '<br />');
  };

  return (
    <div className="space-y-8 animate-fade-in">
         
        {/* Header & Preview */}
        <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow relative">
            {news.isFromCache && (
                <span className="absolute top-4 right-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800">
                    Carregado do cache
                </span>
            )}

            <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-gray-400">Prévia de Busca</h2>
                
                {/* Feedback Buttons */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleFeedback('up')}
                        disabled={feedbackGiven !== null}
                        className={`p-1.5 rounded hover:bg-gray-800 transition-colors ${feedbackGiven === 'up' ? 'text-green-400 bg-green-900/20' : 'text-gray-500'}`}
                        title="Gostei (Ajudar a melhorar)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => handleFeedback('down')}
                        disabled={feedbackGiven !== null}
                        className={`p-1.5 rounded hover:bg-gray-800 transition-colors ${feedbackGiven === 'down' ? 'text-red-400 bg-red-900/20' : 'text-gray-500'}`}
                         title="Não gostei"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.92m-3.76 9.92V19a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                    </button>
                </div>
            </div>

            <SEOPreview 
                title={news.seo.title}
                slug={news.seo.slug}
                description={news.seo.description}
            />
            <div className="mt-6">
                 <QualityScoreCard metrics={news.validation} />
            </div>
        </div>
        
        {/* Technical SEO Analysis */}
        <SEOAnalysisCard report={seoReport || undefined} />

        {/* SEO Data Section */}
        <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-[#1b8a0f]">🚀 Metadados SEO - Rank Math</h2>
                <div className="flex gap-2">
                     <button 
                        onClick={handlePublishWP}
                        disabled={isPublishing}
                        className="flex items-center gap-2 text-sm text-white bg-[#21759b] border border-[#21759b] px-3 py-1 rounded hover:bg-[#135e96] transition-colors disabled:opacity-50"
                        title="Publicar no WordPress conectado"
                     >
                         {isPublishing ? <LoadingSpinner className="h-4 w-4 text-white" /> : (
                             <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.003 0a12.003 12.003 0 0 0-12 12c0 5.53 3.73 10.218 8.818 11.568L4.537 11.37A7.42 7.42 0 0 1 4.38 9.526c0-1.284.462-2.438 1.236-3.333l.144-.145.145.145c3.57 3.57 3.57 9.346 3.57 9.346s.412-1.08.618-1.62l-2.668-8.15c.972-.796 2.212-1.27 3.573-1.27 1.388 0 2.648.493 3.628 1.315l-2.724 8.166s.41.997.616 1.505l3.79-10.92c.098-.04.196-.078.296-.114.03.08.056.163.083.246l-4.72 13.59c3.693-1.606 6.303-5.28 6.303-9.564 0-6.63-5.373-12-12-12z"/></svg>
                                Publicar
                             </>
                         )}
                     </button>
                    <button onClick={handleCopyAllSEO} className="text-sm text-green-400 border border-green-900/50 px-3 py-1 rounded hover:bg-green-900/20">
                        {allSeoCopied ? '✅ Copiado!' : '📋 Copiar Pacote SEO'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                     <CopyableField label="Título SEO" value={news.seo.title} maxChars={60} />
                     <CopyableField label="Descrição SEO" value={news.seo.description} maxChars={160} />
                     <CopyableField label="Slug URL" value={news.seo.slug} isMono />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CopyableField label="Palavra-Chave Primária" value={news.seo.primaryKeyword} />
                    <CopyableField label="Foco SEO" value={news.seo.seoFocus} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 p-3 rounded border border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase block mb-1">Dificuldade</span>
                        <SEOBadge>{news.seo.keywordDifficulty}</SEOBadge>
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-800">
                         <span className="text-[10px] text-gray-500 uppercase block mb-1">Schema</span>
                        <SEOBadge>{news.seo.schemaType}</SEOBadge>
                    </div>
                </div>
            </div>
        </div>

      {/* Visual Assets Section */}
      {news.visualAssets && (
          <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  🎨 Assets Visuais & Multimodal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Prompts de Imagem (Midjourney/DALL-E)</h3>
                      <ul className="space-y-2">
                          {news.visualAssets.imagePrompts.map((prompt, idx) => (
                              <li key={idx} className="bg-gray-900 p-3 rounded border border-gray-800 text-sm text-gray-300 italic">
                                  "{prompt}"
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div>
                       <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Sugestões de Infográfico</h3>
                       <ul className="space-y-2">
                          {news.visualAssets.infographicSuggestions.map((sug, idx) => (
                              <li key={idx} className="bg-gray-900 p-3 rounded border border-gray-800 text-sm text-gray-300">
                                  💡 {sug}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      )}

      {/* Content Section */}
      <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">📰 Conteúdo da Notícia</h2>
            <div className="flex gap-2 bg-gray-900 p-1 rounded">
                <button
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1 text-xs rounded ${viewMode === 'visual' ? 'bg-[#1b8a0f] text-white' : 'text-gray-400'}`}
                >
                    👁️ Visual
                </button>
                <button
                    onClick={() => setViewMode('markdown')}
                    className={`px-3 py-1 text-xs rounded ${viewMode === 'markdown' ? 'bg-[#1b8a0f] text-white' : 'text-gray-400'}`}
                >
                    📝 Markdown
                </button>
            </div>
        </div>
        
        {viewMode === 'visual' ? (
            <div className="relative">
                <VisualEditorToolbar onFormat={handleFormat} />
                <div 
                    ref={contentEditableRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="prose prose-invert max-w-none bg-gray-900/30 p-6 rounded border border-gray-800 min-h-[300px] focus:outline-none focus:ring-1 focus:ring-[#1b8a0f]"
                    dangerouslySetInnerHTML={{ __html: renderHTML(news.content) }}
                />
                <p className="text-xs text-gray-500 mt-2 text-right">* Modo de Edição Visual Ativo</p>
            </div>
        ) : (
            <textarea 
                readOnly 
                className="w-full h-96 bg-gray-900 p-4 rounded border border-gray-800 text-gray-300 font-mono text-sm"
                value={news.content}
            />
        )}
        
        <div className="mt-4 flex justify-end">
             <button onClick={handleCopyContent} className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm">
                {contentCopied ? '✅ Copiado!' : '📋 Copiar Texto'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedNewsDisplay;
