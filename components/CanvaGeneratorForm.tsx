
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import CharacterCounter from './CharacterCounter';
import { CANVA_DOC_TYPES } from '../constants';

interface CanvaGeneratorFormProps {
  isLoading: boolean;
  onSubmit: (docType: string, subject: string, style: string) => void;
}

const MAX_LENGTHS = {
    subject: 300,
    style: 150,
};

const CanvaGeneratorForm: React.FC<CanvaGeneratorFormProps> = ({ isLoading, onSubmit }) => {
  const [docType, setDocType] = useState<string>(CANVA_DOC_TYPES[0]);
  const [subject, setSubject] = useState<string>('');
  const [style, setStyle] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && subject) {
      onSubmit(docType, subject, style);
    }
  };

  return (
    <div className="bg-gray-900/20 p-6 rounded-xl border border-[#136c0b]/30 shadow-[0_0_10px_rgba(27,138,15,0.4)] sticky top-0">
      <h2 className="text-lg font-semibold text-[#1b8a0f] mb-4">Estrutura para Canva</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="docType" className="block text-sm font-medium text-gray-500 mb-1">
            Tipo de Documento
          </label>
          <select
            id="docType"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#136c0b]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] sm:text-sm rounded-md bg-black text-gray-300 transition-all duration-200"
            disabled={isLoading}
          >
            {CANVA_DOC_TYPES.map((type) => (
              <option key={type} value={type} className="bg-black text-gray-300">
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-500 mb-1">
              Assunto Principal / Conteúdo
            </label>
             <CharacterCounter count={subject.length} maxLength={MAX_LENGTHS.subject} />
          </div>
          <textarea
            id="subject"
            rows={4}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={MAX_LENGTHS.subject}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: 5 Dicas para melhorar a produtividade no home office..."
            disabled={isLoading}
            required
          />
        </div>

        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="style" className="block text-sm font-medium text-gray-500 mb-1">
              Estilo Visual Desejado
            </label>
            <CharacterCounter count={style.length} maxLength={MAX_LENGTHS.style} />
          </div>
          <input
            type="text"
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            maxLength={MAX_LENGTHS.style}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Minimalista, Tons pastéis, Tech, Corporativo..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner className="h-5 w-5 -ml-1 mr-3 text-white" /> : 'Gerar Estrutura'}
        </button>
      </form>
    </div>
  );
};

export default CanvaGeneratorForm;
