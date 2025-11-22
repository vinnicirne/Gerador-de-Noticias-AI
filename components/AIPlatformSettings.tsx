
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { AIPlatform, AIModel, AIUsageLog } from '../types';
import LoadingSpinner from './LoadingSpinner';

type Tab = 'platforms' | 'models' | 'usage';

const AIPlatformSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('platforms');
    const [platforms, setPlatforms] = useState<AIPlatform[]>([]);
    const [models, setModels] = useState<AIModel[]>([]);
    const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
    const [stats, setStats] = useState({ totalCost: 0, totalTokens: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load initial data
        setPlatforms(adminService.getAIPlatforms());
        setModels(adminService.getAIModels());
        setUsageLogs(adminService.getAIUsageLogs());
        setStats(adminService.getAICostStats());
        setIsLoading(false);
    }, []);

    const handlePlatformChange = (id: string, field: keyof AIPlatform, value: string | number | boolean) => {
        const updatedPlatforms = platforms.map(p => p.id === id ? { ...p, [field]: value } : p);
        setPlatforms(updatedPlatforms);
        adminService.updateAIPlatform(id, { [field]: value });
    };

    const handleToggleModel = (id: string) => {
        adminService.toggleAIModel(id);
        setModels(adminService.getAIModels());
    };

    if (isLoading) return <LoadingSpinner className="h-8 w-8 text-[#1b8a0f]" />;

    const renderPlatforms = () => (
        <div className="space-y-6">
            {platforms.map((plat) => (
                <div key={plat.id} className={`p-6 rounded-xl border transition-colors ${plat.isActive ? 'bg-[#1b8a0f]/5 border-[#1b8a0f]/50' : 'bg-gray-900/40 border-gray-800'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${plat.isActive ? 'bg-[#1b8a0f]' : 'bg-gray-700'}`}>
                                <span className="text-white font-bold text-lg">{plat.displayName.charAt(0)}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{plat.displayName}</h3>
                                <p className="text-xs text-gray-400 font-mono uppercase">{plat.name}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={plat.isActive}
                                onChange={() => handlePlatformChange(plat.id, 'isActive', !plat.isActive)}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1b8a0f]"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">API Key</label>
                            <div className="relative">
                                <input 
                                    type="password"
                                    value={plat.apiKey}
                                    onChange={(e) => handlePlatformChange(plat.id, 'apiKey', e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-gray-300 text-sm font-mono focus:border-[#1b8a0f] focus:outline-none pr-8"
                                    placeholder={plat.isActive ? '••••••••••••••••' : 'Não configurada'}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo/Token ($)</label>
                                <input 
                                    type="number"
                                    step="0.000001"
                                    value={plat.costPerToken}
                                    onChange={(e) => handlePlatformChange(plat.id, 'costPerToken', Number(e.target.value))}
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-gray-300 text-sm font-mono focus:border-[#1b8a0f] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Tokens</label>
                                <input 
                                    type="number"
                                    disabled
                                    value={plat.maxTokens}
                                    className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-400 text-sm font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderModels = () => (
        <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3">Modelo</th>
                            <th className="px-6 py-3">Plataforma</th>
                            <th className="px-6 py-3">Contexto</th>
                            <th className="px-6 py-3">Capacidades</th>
                            <th className="px-6 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model) => {
                            const platform = platforms.find(p => p.id === model.platformId);
                            return (
                                <tr key={model.id} className="bg-black border-b border-gray-800 hover:bg-gray-900/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{model.name}</div>
                                        <div className="text-xs text-gray-600 font-mono">{model.modelId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                                            {platform?.displayName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        {model.contextLength.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {model.supportsVision && (
                                                <span className="text-blue-400" title="Suporta Visão/Imagem">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </span>
                                            )}
                                            {model.supportsAudio && (
                                                <span className="text-purple-400" title="Suporta Áudio">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleToggleModel(model.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${model.isActive ? 'bg-[#1b8a0f]/20 text-[#1b8a0f] hover:bg-[#1b8a0f]/30' : 'bg-red-900/20 text-red-400 hover:bg-red-900/30'}`}
                                        >
                                            {model.isActive ? 'Ativo' : 'Inativo'}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderUsage = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tokens Processados (Total)</p>
                    <h2 className="text-3xl font-bold text-white mt-2">{stats.totalTokens.toLocaleString()}</h2>
                </div>
                <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custo Estimado (USD)</p>
                    <h2 className="text-3xl font-bold text-[#1b8a0f] mt-2">$ {stats.totalCost.toFixed(4)}</h2>
                </div>
            </div>

            <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 overflow-hidden">
                <div className="p-4 border-b border-[#136c0b]/30">
                    <h3 className="text-white font-bold">Logs de Consumo Recente</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Plataforma</th>
                                <th className="px-6 py-3">Modelo</th>
                                <th className="px-6 py-3 text-right">Tokens</th>
                                <th className="px-6 py-3 text-right">Custo ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usageLogs.map((log) => (
                                <tr key={log.id} className="bg-black border-b border-gray-800 hover:bg-gray-900/50">
                                    <td className="px-6 py-4 text-xs text-gray-500">{log.timestamp}</td>
                                    <td className="px-6 py-4">{log.platform}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{log.model}</td>
                                    <td className="px-6 py-4 text-right text-white">{log.totalTokens.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-[#1b8a0f] font-bold">{log.cost.toFixed(6)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Sistema Multi-IA</h2>
                    <p className="text-gray-400 text-sm">Gerencie plataformas, modelos e monitore custos de API.</p>
                </div>
                <div className="flex bg-black border border-[#136c0b]/30 rounded-lg p-1">
                    {(['platforms', 'models', 'usage'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab 
                                ? 'bg-[#1b8a0f] text-white shadow-sm' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab === 'platforms' ? 'Plataformas' : tab === 'models' ? 'Modelos' : 'Uso & Custos'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'platforms' && renderPlatforms()}
            {activeTab === 'models' && renderModels()}
            {activeTab === 'usage' && renderUsage()}
        </div>
    );
};

export default AIPlatformSettings;
