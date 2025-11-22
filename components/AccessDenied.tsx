
import React from 'react';

interface AccessDeniedProps {
  onGoBack?: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onGoBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
      <div className="bg-red-900/20 p-6 rounded-full mb-6 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2">Acesso Negado</h1>
      <p className="text-red-400 font-medium text-lg mb-4">Erro 403: Permissão Insuficiente</p>
      
      <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
        Você não possui as credenciais necessárias para acessar esta área administrativa. 
        Esta ação foi registrada nos logs de segurança.
      </p>
      
      {onGoBack && (
        <button 
          onClick={onGoBack}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all border border-gray-600 hover:border-gray-500 flex items-center gap-2 mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para um local seguro
        </button>
      )}
    </div>
  );
};

export default AccessDenied;
