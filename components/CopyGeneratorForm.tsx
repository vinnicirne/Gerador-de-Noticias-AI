
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import CharacterCounter from './CharacterCounter';
import { COPYWRITING_TYPES } from '../constants';
import AIModelSelector from './AIModelSelector';
import { AIModel } from '../types';

interface CopyGeneratorFormProps {
  isLoading: boolean;
  onSubmit: (copyType: { id: string, name: string }, productName: string, targetAudience: string, message: string, model: AIModel | null) => void;
}

const MAX_LENGTHS = {
    productName: 100,
    targetAudience: 300,
    message: 500,
};

const CopyGeneratorForm: React.FC<CopyGeneratorFormProps> = ({ isLoading, onSubmit }) => {
  const [selectedCopyTypeId, setSelectedCopyTypeId] = useState<string>(COPYWRITING_TYPES[0].id);
  const [productName, setProductName] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedType = COPYWRITING_TYPES.find(c => c.id === selectedCopyTypeId);
    if (selectedType && !isLoading) {
      onSubmit(selectedType, productName, targetAudience, message, selectedModel);
    }
  };

  return (
    <div className="bg-gray-900/20 p-6 rounded-xl border border-[#136c0b]/30 shadow-[0_0_10px_rgba(27,138,15,0.4)] sticky top-0">
      <h2 className="text-lg font-semibold text-[#1b8a0f] mb-4">Gerador de Copy</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <AIModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} disabled={isLoading} />
        
        <div>
          <label htmlFor="copy-type" className="block text-sm font-medium text-gray-500 mb-1">
            Tipo de Copy
          </label>
          <select
            id="copy-type"
            value={selectedCopyTypeId}
            onChange={(e) => setSelectedCopyTypeId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[#136c0b]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] sm:text-sm rounded-md bg-black text-gray-300 transition-all duration-200"
            disabled={isLoading}
          >
            {COPYWRITING_TYPES.map((type) => (
              <option key={type.id} value={type.id} className="bg-black text-gray-300">
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="product_name_copy" className="block text-sm font-medium text-gray-500 mb-1">
              Nome do Produto/Serviço
            </label>
            <CharacterCounter count={productName.length} maxLength={MAX_LENGTHS.productName} />
          </div>
          <input
            type="text"
            id="product_name_copy"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            maxLength={MAX_LENGTHS.productName}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: GDN_IA"
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="target_audience_copy" className="block text-sm font-medium text-gray-500 mb-1">
              Público-alvo
            </label>
             <CharacterCounter count={targetAudience.length} maxLength={MAX_LENGTHS.targetAudience} />
          </div>
          <textarea
            id="target_audience_copy"
            rows={2}
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            maxLength={MAX_LENGTHS.targetAudience}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Empreendedores digitais que..."
            disabled={isLoading}
            required
          />
        </div>

        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="message_copy" className="block text-sm font-medium text-gray-500 mb-1">
              Mensagem Principal / Oferta
            </label>
            <CharacterCounter count={message.length} maxLength={MAX_LENGTHS.message} />
          </div>
          <textarea
            id="message_copy"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_LENGTHS.message}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Desconto de 50% na primeira assinatura..."
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedModel}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner className="h-5 w-5 -ml-1 mr-3 text-white" /> : 'Gerar Copy'}
        </button>
      </form>
    </div>
  );
};

export default CopyGeneratorForm;
