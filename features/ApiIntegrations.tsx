
import React, { useState } from 'react';
import { apiGateway } from '../services/apiGateway';
import LoadingSpinner from '../components/LoadingSpinner';
import CopyableField from '../components/CopyableField';

const ApiIntegrations: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/news/generate');
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify({
    themeId: 'tecnologia',
    customPrompt: 'Foco em IA Generativa',
    tone: 'Técnico e Analítico 📊'
  }, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateApiKey = () => {
    const key = 'sk_gdn_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(key);
  };

  const handleTestRequest = async () => {
    if (!apiKey) {
      alert("Por favor, gere uma API Key primeiro.");
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const payload = requestBody ? JSON.parse(requestBody) : {};
      const res = await apiGateway({
        endpoint: selectedEndpoint,
        method: selectedEndpoint.includes('set-preferred') ? 'POST' : 'GET', // Detecção simples
        apiKey: apiKey,
        payload: payload
      });
      setResponse(res);
    } catch (error) {
      setResponse({ error: "Invalid JSON format in request body." });
    } finally {
      setIsLoading(false);
    }
  };

  const endpoints = [
    { path: '/api/v1/news/generate', label: 'Gerar Notícia', template: { themeId: 'tecnologia', customPrompt: '...', tone: 'Neutro' } },
    { path: '/api/v1/landing-page/generate', label: 'Gerar Landing Page', template: { productName: 'GDN_IA', targetAudience: 'Marketers', painPoints: '...', keyFeatures: '...' } },
    { path: '/api/v1/copy/generate', label: 'Gerar Marketing Copy', template: { copyTypeId: 'facebook-aida', productName: '...', targetAudience: '...', message: '...' } },
    { path: '/api/v1/prompts/generate', label: 'Gerar Prompt IA', template: { platform: 'Midjourney', category: 'Logos', description: '...', style: '...' } },
    { path: '/api/v1/canva/structure', label: 'Estrutura Canva', template: { docType: 'Post Instagram', subject: '...', style: '...' } },
    // Novos Endpoints
    { path: '/api/ai-models/', label: 'Listar Modelos IA (GET)', template: {} },
    { path: '/api/set-preferred-model/', label: 'Definir Modelo Preferido', template: { model_id: 'gpt-4-turbo' } },
    { path: '/api/history/', label: 'Histórico de Gerações (GET)', template: {} },
  ];

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value;
    setSelectedEndpoint(path);
    const endpoint = endpoints.find(ep => ep.path === path);
    if (endpoint) {
      setRequestBody(JSON.stringify(endpoint.template, null, 2));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Sidebar da API */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="bg-gray-900/20 p-6 rounded-xl border border-[#136c0b]/30 shadow-[0_0_10px_rgba(27,138,15,0.4)]">
          <h2 className="text-lg font-semibold text-[#1b8a0f] mb-4">Autenticação</h2>
          <p className="text-sm text-gray-400 mb-4">Gere uma chave de API para autenticar suas requisições.</p>
          
          {apiKey ? (
            <div className="space-y-2">
               <label className="text-xs font-mono text-gray-500 uppercase">Sua API Key</label>
               <div className="bg-black p-2 rounded border border-gray-800 font-mono text-sm text-green-400 break-all">
                 {apiKey}
               </div>
               <p className="text-xs text-gray-500 mt-2">Inclua esta chave no header Authorization das suas requisições reais.</p>
            </div>
          ) : (
            <button 
              onClick={generateApiKey}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] transition-colors"
            >
              Gerar Nova API Key
            </button>
          )}
        </div>

        <div className="bg-gray-900/20 p-6 rounded-xl border border-[#136c0b]/30">
          <h2 className="text-lg font-semibold text-white mb-4">Documentação</h2>
          <ul className="space-y-2">
            {endpoints.map(ep => (
              <li key={ep.path} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${ep.path.includes('generate') || ep.path.includes('set') ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>
                      {ep.path.includes('generate') || ep.path.includes('set') ? 'POST' : 'GET'}
                  </span>
                  <span className="text-gray-300 font-mono truncate" title={ep.path}>{ep.path}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Playground */}
      <div className="lg:col-span-8 xl:col-span-9">
        <div className="bg-black border border-[#136c0b]/30 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.4)] overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-[#136c0b]/30 bg-gray-900/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#1b8a0f]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
              API Playground
            </h2>
            <span className="text-xs text-gray-500">Ambiente de Teste (Sandbox)</span>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Endpoint</label>
                  <select 
                    value={selectedEndpoint} 
                    onChange={handleEndpointChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white text-sm focus:ring-[#1b8a0f] focus:border-[#1b8a0f]"
                  >
                    {endpoints.map(ep => (
                      <option key={ep.path} value={ep.path}>{ep.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500 mb-1">Método</label>
                   <input 
                        type="text" 
                        value={selectedEndpoint.includes('generate') || selectedEndpoint.includes('set') ? 'POST' : 'GET'} 
                        disabled 
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-gray-400 text-sm" 
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Request Body (JSON)</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 text-sm font-mono text-gray-300 focus:ring-[#1b8a0f] focus:border-[#1b8a0f]"
                  spellCheck="false"
                />
              </div>

              <div className="flex justify-end">
                 <button 
                    onClick={handleTestRequest}
                    disabled={isLoading || !apiKey}
                    className="flex items-center gap-2 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                  >
                    {isLoading ? <LoadingSpinner className="h-4 w-4 text-white" /> : (
                      <>
                        <span>Enviar Requisição</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                      </>
                    )}
                  </button>
              </div>

              {response && (
                <div className="mt-8 animate-fade-in">
                   <label className="block text-sm font-medium text-gray-500 mb-1">Response</label>
                   <div className={`rounded-md border ${response.status === 200 ? 'border-[#136c0b]/50 bg-[#136c0b]/10' : 'border-red-900/50 bg-red-900/10'} p-4`}>
                      <div className="flex justify-between items-center mb-2">
                         <span className={`text-xs font-bold ${response.status === 200 ? 'text-green-400' : 'text-red-400'}`}>
                            Status: {response.status}
                         </span>
                         <span className="text-xs text-gray-500">{response.timestamp}</span>
                      </div>
                      <pre className="text-xs sm:text-sm font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-[400px]">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegrations;
