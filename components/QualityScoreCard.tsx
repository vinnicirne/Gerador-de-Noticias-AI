
import React from 'react';
import type { ContentValidationMetrics } from '../types';

interface QualityScoreCardProps {
  metrics?: ContentValidationMetrics;
}

const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  let colorClass = 'bg-red-500';
  if (score >= 80) colorClass = 'bg-[#1b8a0f]';
  else if (score >= 50) colorClass = 'bg-yellow-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="text-xs font-medium text-white">{score}/100</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

const QualityScoreCard: React.FC<QualityScoreCardProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Validação de Qualidade & Segurança
        </h3>
        <div className="text-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Média Geral</span>
            <div className="text-2xl font-bold text-[#1b8a0f]">{metrics.overallScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <ScoreBar label="Verificação de Fatos (Coerência)" score={metrics.factualityScore} />
            <ScoreBar label="Originalidade" score={metrics.originalityScore} />
        </div>
        <div>
            <ScoreBar label="Qualidade de Leitura" score={metrics.readabilityScore} />
            <ScoreBar label="Conformidade SEO" score={metrics.seoScore} />
        </div>
      </div>

      {metrics.suggestions && metrics.suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Sugestões de Melhoria:</p>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {metrics.suggestions.map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default QualityScoreCard;
