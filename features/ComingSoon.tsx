import React from 'react';

interface ComingSoonProps {
    toolName: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ toolName }) => {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-gray-900/20 p-8 rounded-xl min-h-[400px] w-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#1b8a0f] mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h3 className="text-2xl font-bold text-white">{toolName}</h3>
        <p className="mt-2 text-lg text-[#1b8a0f] font-semibold">
          Em Breve!
        </p>
         <p className="mt-4 max-w-md text-gray-400">
          Estamos trabalhando para trazer esta incrível ferramenta para você. Fique ligado para mais atualizações!
        </p>
      </div>
    );
};

export default ComingSoon;