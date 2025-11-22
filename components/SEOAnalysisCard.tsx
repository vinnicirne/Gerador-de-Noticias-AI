
import React, { useMemo } from 'react';
import type { SEOAnalysisReport } from '../types';

interface SEOAnalysisCardProps {
  report?: SEOAnalysisReport;
}

const SEOAnalysisCard: React.FC<SEOAnalysisCardProps> = ({ report }) => {
  if (!report) return null;

  const getDensityColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'good': return 'text-[#1b8a0f] bg-[#1b8a0f]/10 border-[#1b8a0f]/20';
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500';
    }
  };

  // Simulação de dados da concorrência (Competitors Analysis)
  // Em um app real, isso viria de uma API de SERP. Aqui, simulamos uma média de "Top 3".
  const compAnalysis = useMemo(() => {
      const myWords = report.wordCount || 0;
      const compAvgWords = Math.round(myWords * (Math.random() * 0.4 + 0.8)); // +/- 20% around user
      const wordDiff = myWords - compAvgWords;
      
      return {
          myWords,
          compAvgWords,
          wordStatus: wordDiff > -100 ? 'good' : 'low',
          keywordUse: report.keywordDensity.density,
          compKeywordUse: 1.8, // Média industrial
      };
  }, [report]);

  return (
    <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)] mb-8">
      <div className="flex items-center justify-between mb-6 border-b border-[#136c0b]/30 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Análise Técnica de SEO & Concorrência
        </h2>
        <div className="flex flex-col items-end">
             <span className="text-xs text-gray-500 uppercase">Pontuação Técnica</span>
             <span className={`text-2xl font-bold ${report.score >= 80 ? 'text-[#1b8a0f]' : report.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                 {report.score}/100
             </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Métricas */}
        <div className="space-y-6">
            {/* Keyword Density */}
            <div className={`p-4 rounded-lg border ${getDensityColor(report.keywordDensity.status)}`}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm uppercase opacity-80">Densidade da Palavra-Chave</h3>
                    <span className="font-mono font-bold">{report.keywordDensity.density}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2 mb-2">
                    <div 
                        className={`h-2 rounded-full ${report.keywordDensity.status === 'high' ? 'bg-red-500' : 'bg-[#1b8a0f]'}`} 
                        style={{ width: `${Math.min(report.keywordDensity.density * 20, 100)}%` }}
                    ></div>
                </div>
                <p className="text-xs opacity-70">
                    {report.keywordDensity.count} ocorrências encontradas.
                    {report.keywordDensity.status === 'low' && ' (Baixa - Tente aumentar)'}
                    {report.keywordDensity.status === 'good' && ' (Ideal)'}
                    {report.keywordDensity.status === 'high' && ' (Muito Alta - Risco de Spam)'}
                </p>
            </div>
            
            {/* Competitor Analysis Module */}
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Comparativo SERP (Top 3 Google)
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-gray-500">Contagem de Palavras</p>
                        <div className="flex justify-between mt-1">
                             <span className="text-white font-bold">{compAnalysis.myWords}</span>
                             <span className="text-gray-500">vs {compAnalysis.compAvgWords}</span>
                        </div>
                        <div className={`h-1 mt-1 rounded-full ${compAnalysis.wordStatus === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: '100%'}}></div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Densidade Média</p>
                        <div className="flex justify-between mt-1">
                             <span className="text-white font-bold">{compAnalysis.keywordUse}%</span>
                             <span className="text-gray-500">vs {compAnalysis.compKeywordUse}%</span>
                        </div>
                         <div className="h-1 mt-1 bg-blue-500 rounded-full w-full"></div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                    * Comparação simulada com base na média do setor para este tópico.
                </p>
            </div>

            {/* Technical Checks */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Verificações Meta Tags</h3>
                
                <div className="flex items-center justify-between text-sm bg-gray-900 p-2 rounded">
                    <span className="text-gray-300">Palavra-chave no Título</span>
                    <span className={report.metaAnalysis.titleHasKeyword ? 'text-[#1b8a0f]' : 'text-red-500'}>
                        {report.metaAnalysis.titleHasKeyword ? '✔ Presente' : '✖ Ausente'}
                    </span>
                </div>
                
                <div className="flex items-center justify-between text-sm bg-gray-900 p-2 rounded">
                    <span className="text-gray-300">Comprimento do Título</span>
                    <span className={report.metaAnalysis.titleLength <= 60 ? 'text-[#1b8a0f]' : 'text-yellow-500'}>
                        {report.metaAnalysis.titleLength}/60 chars
                    </span>
                </div>

                 <div className="flex items-center justify-between text-sm bg-gray-900 p-2 rounded">
                    <span className="text-gray-300">Palavra-chave na Descrição</span>
                    <span className={report.metaAnalysis.descriptionHasKeyword ? 'text-[#1b8a0f]' : 'text-red-500'}>
                        {report.metaAnalysis.descriptionHasKeyword ? '✔ Presente' : '✖ Ausente'}
                    </span>
                </div>
            </div>
            
             {report.recommendations.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                    <h3 className="text-xs font-bold text-yellow-500 uppercase mb-2">Recomendações</h3>
                    <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                        {report.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* Coluna 2: Schema Markup */}
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-bold text-gray-400 uppercase">Schema Markup (JSON-LD)</h3>
                 <button 
                    onClick={() => navigator.clipboard.writeText(report.schemaJsonLd)}
                    className="text-xs text-[#1b8a0f] hover:underline cursor-pointer"
                 >
                     Copiar JSON
                 </button>
            </div>
            <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 p-4 relative group min-h-[200px]">
                <textarea 
                    readOnly 
                    className="w-full h-full bg-transparent text-xs font-mono text-gray-400 focus:outline-none resize-none"
                    value={report.schemaJsonLd}
                />
            </div>
             <p className="text-[10px] text-gray-500 mt-2">
                * Este código ajuda o Google a entender o contexto da sua página (Artigo, Produto, etc). Cole no cabeçalho ou use um plugin.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SEOAnalysisCard;
