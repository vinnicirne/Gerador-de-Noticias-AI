
import React, { useState, useEffect } from 'react';
import { integrationService } from '../services/integrationService';
import { aiModelService } from '../services/aiModelService';
import { IntegrationConfig, FeedbackLog, AIModel } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import AIModelSelector from '../components/AIModelSelector';

type Tab = 'integrations' | 'ai-models';

const IntegrationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('integrations');
  const [config, setConfig] = useState<IntegrationConfig>(integrationService.getConfig());
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for the preferred model selector
  const [preferredModel, setPreferredModel] = useState<AIModel | null>(null);

  useEffect(() => {
    setFeedbackLogs(integrationService.getFeedbackLogs());
    // On tab load, find the full AIModel object for the preferred model ID
    const preferredModelId = aiModelService.getUserPreferredModelId();
    if(preferredModelId) {
        const models = aiModelService.getAvailableModels();
        const model = models.find(m => m.modelId === preferredModelId);
        setPreferredModel(model || null);
    }
  }, [activeTab]);

  const handleSave = (section: keyof IntegrationConfig, data: any) => {
    setIsLoading(true);
    const newConfig = { ...config, [section]: { ...data, connected: true } };
    
    setTimeout(() => {
      integrationService.saveConfig(newConfig);
      setConfig(newConfig);
      setIsLoading(false);
    }, 1000);
  };

  const handlePreferredModelChange = (model: AIModel | null) => {
    setPreferredModel(model);
    // Note: With autoSave={true} in AIModelSelector, we don't explicitly need to call setter here if we only want it saved on change,
    // but updating local state is still good practice for UI responsiveness.
  };

  const handleDisconnect = (section: keyof IntegrationConfig) => {
    const newConfig = { ...config, [section]: { ...config[section], connected: false } };
    integrationService.saveConfig(newConfig);
    setConfig(newConfig);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex border-b border-[#136c0b]/30 mb-6">
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'border-b-2 border-[#1b8a0f] text-[#1b8a0f]' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrações Externas
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'ai-models' ? 'border-b-2 border-[#1b8a0f] text-[#1b8a0f]' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('ai-models')}
        >
          IA & Modelos (Avançado)
        </button>
      </div>

      {activeTab === 'integrations' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.003 0a12.003 12.003 0 0 0-12 12c0 5.53 3.73 10.218 8.818 11.568L4.537 11.37A7.42 7.42 0 0 1 4.38 9.526c0-1.284.462-2.438 1.236-3.333l.144-.145.145.145c3.57 3.57 3.57 9.346 3.57 9.346s.412-1.08.618-1.62l-2.668-8.15c.972-.796 2.212-1.27 3.573-1.27 1.388 0 2.648.493 3.628 1.315l-2.724 8.166s.41.997.616 1.505l3.79-10.92c.098-.04.196-.078.296-.114.03.08.056.163.083.246l-4.72 13.59c3.693-1.606 6.303-5.28 6.303-9.564 0-6.63-5.373-12-12-12z"/></svg>
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  WordPress
                  {config.wordpress?.connected && <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded-full border border-green-800">Conectado</span>}
                </h2>
                <p className="text-gray-400 text-sm mb-6">Conecte seu site para publicar notícias geradas diretamente com um clique.</p>

                {config.wordpress?.connected ? (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <p className="text-sm text-gray-300">Conectado a: <span className="text-white font-semibold">{config.wordpress.siteUrl}</span></p>
                      <p className="text-sm text-gray-300">Usuário: <span className="text-white font-semibold">{config.wordpress.username}</span></p>
                      <button onClick={() => handleDisconnect('wordpress')} className="mt-4 text-red-400 text-sm hover:underline">Desconectar</button>
                  </div>
                ) : (
                  <IntegrationForm 
                    fields={[
                      { name: 'siteUrl', label: 'URL do Site', placeholder: 'https://meusite.com' },
                      { name: 'username', label: 'Usuário', placeholder: 'admin' },
                      { name: 'appPassword', label: 'Application Password', type: 'password', placeholder: 'xxxx xxxx xxxx xxxx' }
                    ]}
                    onSubmit={(data) => handleSave('wordpress', data)}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>

            <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-32 h-32 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 22h-11v-6.5h11V22zm1-17h10v17h-10V5zm-1-3H1.5v18.5h11V2z"/></svg>
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  Google Analytics 4
                  {config.googleAnalytics?.connected && <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded-full border border-green-800">Conectado</span>}
                </h2>
                <p className="text-gray-400 text-sm mb-6">Acompanhe a performance das suas notícias geradas (Views, CTR).</p>

                {config.googleAnalytics?.connected ? (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <p className="text-sm text-gray-300">Propriedade ID: <span className="text-white font-semibold">{config.googleAnalytics.propertyId}</span></p>
                      <button onClick={() => handleDisconnect('googleAnalytics')} className="mt-4 text-red-400 text-sm hover:underline">Desconectar</button>
                  </div>
                ) : (
                  <IntegrationForm 
                    fields={[
                      { name: 'propertyId', label: 'GA4 Property ID', placeholder: 'G-XXXXXXXXXX' }
                    ]}
                    onSubmit={(data) => handleSave('googleAnalytics', data)}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>

            <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-32 h-32 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.6 11.2h-3.2v3.2h3.2v-3.2zM16 5.6h-3.2v8.8h3.2V5.6zM10.4 8h-3.2v6.4h3.2V8zM4.8 12.8H1.6v1.6h3.2v-1.6z"/></svg>
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  Search Console
                  {config.searchConsole?.connected && <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded-full border border-green-800">Conectado</span>}
                </h2>
                <p className="text-gray-400 text-sm mb-6">Monitore a indexação e palavras-chave das suas páginas.</p>

                {config.searchConsole?.connected ? (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <p className="text-sm text-gray-300">Domínio: <span className="text-white font-semibold">{config.searchConsole.siteUrl}</span></p>
                      <button onClick={() => handleDisconnect('searchConsole')} className="mt-4 text-red-400 text-sm hover:underline">Desconectar</button>
                  </div>
                ) : (
                  <IntegrationForm 
                    fields={[
                      { name: 'siteUrl', label: 'URL da Propriedade', placeholder: 'sc-domain:meusite.com' }
                    ]}
                    onSubmit={(data) => handleSave('searchConsole', data)}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
                 <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold text-white mb-4">Modelo Preferido do Usuário</h2>
                    <p className="text-gray-400 text-sm mb-6">Selecione seu modelo de IA padrão. Ele será pré-selecionado em todas as ferramentas de geração.</p>
                    <AIModelSelector 
                        label="Modelo de IA Padrão"
                        selectedModel={preferredModel}
                        onModelChange={handlePreferredModelChange}
                        showHelpText={true}
                        autoSave={true}
                    />
                 </div>
            </div>

            <div className="lg:col-span-7">
                 <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow h-full flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex justify-between items-center">
                        Histórico de Feedback
                        <span className="text-xs font-normal bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Aprendizado Simulado</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                        {feedbackLogs.length === 0 ? (
                            <p className="text-gray-500 text-center py-8 italic">Nenhum feedback registrado ainda.</p>
                        ) : (
                            <div className="space-y-3">
                                {feedbackLogs.map(log => (
                                    <div key={log.id} className="bg-gray-900/50 border border-gray-800 p-3 rounded flex items-start gap-3">
                                        <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${log.rating === 'up' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                             {log.rating === 'up' ? (
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                             ) : (
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.92m-3.76 9.92V19a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                                             )}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{log.context}</p>
                                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                <span className="capitalize">{log.type}</span>
                                                <span>•</span>
                                                <span>{log.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

const IntegrationForm: React.FC<{ fields: any[], onSubmit: (data: any) => void, isLoading: boolean }> = ({ fields, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-4">
            {fields.map(field => (
                <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">{field.label}</label>
                    <input 
                        type={field.type || 'text'}
                        name={field.name}
                        placeholder={field.placeholder}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white text-sm focus:ring-[#1b8a0f] focus:border-[#1b8a0f]"
                    />
                </div>
            ))}
            <button 
                onClick={() => onSubmit(formData)}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-[#1b8a0f] hover:bg-[#24a813] disabled:opacity-50 transition-colors flex justify-center"
            >
                {isLoading ? <LoadingSpinner className="h-4 w-4 text-white" /> : 'Conectar'}
            </button>
        </div>
    )
}

export default IntegrationsDashboard;
