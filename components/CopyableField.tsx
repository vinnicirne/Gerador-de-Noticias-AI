
import React, { useState } from 'react';

interface CopyableFieldProps {
  label: string;
  value: string;
  isMono?: boolean;
  maxChars?: number;
}

const CopyableField: React.FC<CopyableFieldProps> = ({ label, value, isMono = false, maxChars }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const currentLength = value.length;
  let countColor = 'text-gray-500';
  
  if (maxChars) {
      if (currentLength > maxChars) countColor = 'text-red-500';
      else if (currentLength > maxChars * 0.9) countColor = 'text-yellow-500';
      else countColor = 'text-[#1b8a0f]';
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-[#1b8a0f]/30 transition-colors group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-baseline gap-2">
            <label className="block font-semibold text-gray-400 text-xs uppercase tracking-wider">{label}</label>
            {maxChars && (
                <span className={`text-[10px] font-mono ${countColor}`}>
                    {currentLength}/{maxChars}
                </span>
            )}
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-[#1b8a0f] transition-colors focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
          title={`Copiar ${label}`}
        >
          {copied ? (
            <div className="flex items-center space-x-1">
                <span className="text-[#1b8a0f] text-xs font-bold">Copiado!</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
                 <span className="text-xs">Copiar</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </div>
          )}
        </button>
      </div>
      <div className={`w-full bg-black/50 p-3 rounded border border-gray-700 text-gray-300 text-sm break-words ${isMono ? 'font-mono text-xs' : ''}`}>
        {value || <span className="text-gray-600 italic">Vazio</span>}
      </div>
    </div>
  );
};

export default CopyableField;
