
import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

const tools = [
  { id: 'news', name: 'Gerador de Notícias', icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z' },
  { id: 'landing-page', name: 'Gerador de Landing Page', icon: 'M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z' },
  { id: 'copy', name: 'Gerador de Copy', icon: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10' },
  { id: 'canva', name: 'Estrutura para Canva', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' },
  { id: 'prompts', name: 'Gerador de Prompts', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z' },
  { id: 'api-integrations', name: 'API & Desenvolvedores', icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5' },
  { id: 'integrations', name: 'Configurações & Integrações', icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854-.107 1.204l-.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  const [user, setUser] = useState<UserProfile>(userService.getUser());

  useEffect(() => {
    // Subscreve para atualizações do usuário (créditos)
    return userService.subscribe(setUser);
  }, []);

  return (
    <aside className="w-64 flex flex-col bg-black border-r border-[#136c0b]/30 hidden sm:flex">
        <div className="h-16 flex items-center justify-center px-4 border-b border-[#136c0b]/30">
             <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-7 h-7 bg-[#1b8a0f] rounded-md flex items-center justify-center">
                    <span className="text-white font-mono font-bold text-sm">&gt;_</span>
                </div>
              GDN_IA
            </h1>
        </div>
        
        {/* User Credit Badge */}
        <div className="px-4 pt-4">
            <button 
                onClick={() => setActiveTool('credits')}
                className="w-full bg-gray-900/50 border border-[#136c0b]/30 rounded-lg p-3 flex justify-between items-center hover:bg-gray-900 transition-colors group"
            >
                <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500">Seus Créditos</span>
                    <span className="text-lg font-bold text-[#1b8a0f] group-hover:text-white transition-colors">{user.credits}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#1b8a0f]/20 flex items-center justify-center text-[#1b8a0f]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
            </button>
        </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium
              ${activeTool === tool.id
                ? 'bg-[#136c0b]/20 text-[#1b8a0f] shadow-[0_0_10px_rgba(27,138,15,0.4)]'
                : 'text-gray-400 hover:bg-gray-900/20 hover:text-white'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
            </svg>
            <span>{tool.name}</span>
          </button>
        ))}

        {/* Admin Link - Protected */}
        {userService.isAdmin() && (
             <button
                onClick={() => setActiveTool('admin')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium border-t border-gray-800 mt-4 pt-4
                ${activeTool === 'admin'
                    ? 'bg-[#136c0b]/20 text-[#1b8a0f] shadow-[0_0_10px_rgba(27,138,15,0.4)]'
                    : 'text-gray-400 hover:bg-gray-900/20 hover:text-white'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
                <span>Administração</span>
            </button>
        )}
      </nav>
      <div className="p-4 border-t border-gray-900 text-center text-xs text-gray-500">
        <p className="truncate">{user.email}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
