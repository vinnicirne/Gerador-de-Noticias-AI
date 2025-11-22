import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import CharacterCounter from './CharacterCounter';

interface LandingPageFormProps {
  isLoading: boolean;
  onSubmit: (productName: string, targetAudience: string, painPoints: string, keyFeatures: string) => void;
}

const MAX_LENGTHS = {
    productName: 100,
    targetAudience: 300,
    painPoints: 500,
    keyFeatures: 500,
};

const LandingPageForm: React.FC<LandingPageFormProps> = ({ isLoading, onSubmit }) => {
  const [productName, setProductName] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [painPoints, setPainPoints] = useState<string>('');
  const [keyFeatures, setKeyFeatures] = useState<string>('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit(productName, targetAudience, painPoints, keyFeatures);
    }
  };

  return (
    <div className="bg-gray-900/20 p-6 rounded-xl border border-[#136c0b]/30 shadow-[0_0_10px_rgba(27,138,15,0.4)] sticky top-0">
      <h2 className="text-lg font-semibold text-[#1b8a0f] mb-4">Gerador de Landing Page</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="product_name" className="block text-sm font-medium text-gray-500 mb-1">
              Nome do Produto/Serviço
            </label>
            <CharacterCounter count={productName.length} maxLength={MAX_LENGTHS.productName} />
          </div>
          <input
            type="text"
            id="product_name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            maxLength={MAX_LENGTHS.productName}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: GDN_IA, a plataforma de IA..."
            disabled={isLoading}
            required
          />
        </div>

        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-500 mb-1">
              Público-alvo
            </label>
             <CharacterCounter count={targetAudience.length} maxLength={MAX_LENGTHS.targetAudience} />
          </div>
          <textarea
            id="target_audience"
            rows={2}
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            maxLength={MAX_LENGTHS.targetAudience}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Criadores de conteúdo, agências..."
            disabled={isLoading}
            required
          />
        </div>

        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="pain_points" className="block text-sm font-medium text-gray-500 mb-1">
              Pontos de Dor (O que resolve?)
            </label>
            <CharacterCounter count={painPoints.length} maxLength={MAX_LENGTHS.painPoints} />
          </div>
          <textarea
            id="pain_points"
            rows={3}
            value={painPoints}
            onChange={(e) => setPainPoints(e.target.value)}
            maxLength={MAX_LENGTHS.painPoints}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Falta de tempo para criar conteúdo, bloqueio criativo, custos altos com redatores..."
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
           <div className="flex justify-between items-center">
            <label htmlFor="key_features" className="block text-sm font-medium text-gray-500 mb-1">
              Principais Features (Como resolve?)
            </label>
            <CharacterCounter count={keyFeatures.length} maxLength={MAX_LENGTHS.keyFeatures} />
          </div>
          <textarea
            id="key_features"
            rows={3}
            value={keyFeatures}
            onChange={(e) => setKeyFeatures(e.target.value)}
             maxLength={MAX_LENGTHS.keyFeatures}
            className="mt-1 block w-full shadow-sm sm:text-sm border-[#136c0b]/60 rounded-md bg-black text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] transition-all duration-200"
            placeholder="Ex: Gerador de notícias com IA, gerador de landing pages, prompts avançados..."
            disabled={isLoading}
            required
          />
        </div>


        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#1b8a0f] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner className="h-5 w-5 -ml-1 mr-3 text-white" /> : 'Gerar Landing Page'}
        </button>
      </form>
    </div>
  );
};

export default LandingPageForm;