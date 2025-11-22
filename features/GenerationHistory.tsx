import React, { useState, useEffect, useMemo } from 'react';
import { historyService } from '../services/historyService';
import { GenerationHistoryItem, AIModel } from '../types';
import { aiModelService } from '../services/aiModelService';
import HistoryDetailView from '../components/HistoryDetailView';

const ITEMS_PER_PAGE = 10;

const GenerationHistory: React.FC = () => {
    const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
    const [allModels, setAllModels] = useState<AIModel[]>([]);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    // Filtros
    const [filterType, setFilterType] = useState('');
    const [filterModel, setFilterModel] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('all');

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setHistory(historyService.get());
        setAllModels(aiModelService.getAvailableModels());
    }, []);

    const filteredHistory = useMemo(() => {
        let items = history;

        if (filterType) {
            items = items.filter(item => item.generationType === filterType);
        }
        if (filterModel) {
            items = items.filter(item => item.aiModel === filterModel);
        }
        if (filterPeriod !== 'all') {
            const days = parseInt(filterPeriod, 10);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            items = items.filter(item => new Date(item.createdAt) >= cutoffDate);
        }

        return items;
    }, [history, filterType, filterModel, filterPeriod]);

    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const toggleItem = (id: string) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    const handleCopyResult = (result: any) => {
        const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        navigator.clipboard.writeText(textToCopy);
        // Idealmente, usar um serviço de notificação
        alert('Resultado copiado!');
    };
    
    const typeOptions = [
        { value: 'news', label: 'Notícias' },
        { value: 'landing_page', label: 'Landing Pages' },
        { value: 'copy', label: 'Copys' },
        { value: 'prompt', label: 'Prompts' },
        { value: 'canva', label: 'Estruturas Canva' },
    ];
    
    const periodOptions = [
        { value: '7', label: 'Últimos 7 dias' },
        { value: '30', label: 'Últimos 30 dias' },
        { value: '90', label: 'Últimos 3 meses' },
        { value: 'all', label: 'Todo o período' },
    ];

    const getTypeBadge = (type: GenerationHistoryItem['generationType']) => {
        switch (type) {
            case 'news': return 'bg-blue-900/50 text-blue-300';
            case 'landing_page': return 'bg-purple-900/50 text-purple-300';
            case 'copy': return 'bg-green-900/50 text-green-300';
            case 'prompt': return 'bg-yellow-900/50 text-yellow-300';
            case 'canva': return 'bg-pink-900/50 text-pink-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Histórico de Gerações</h1>
                <span className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-full">{filteredHistory.length} gerações encontradas</span>
            </div>

            {/* Filtros */}
            <div className="bg-gray-900/20 p-4 rounded-xl border border-[#136c0b]/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-black border border-gray-700 rounded-md p-2 text-white text-sm focus:ring-[#1b8a0f] focus:border-[#1b8a0f]"><option value="">Todos os Tipos</option>{typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                    <select value={filterModel} onChange={e => setFilterModel(e.target.value)} className="w-full bg-black border border-gray-700 rounded-md p-2 text-white text-sm focus:ring-[#1b8a0f] focus:border-[#1b8a0f]"><option value="">Todos os Modelos</option>{allModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select>
                    <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="w-full bg-black border border-gray-700 rounded-md p-2 text-white text-sm focus:ring-[#1b8a0f] focus:border-[#1b8a0f]">{periodOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                </div>
            </div>

            {paginatedHistory.length === 0 ? (
                 <div className="text-center py-20 bg-gray-900/20 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-white">Nenhuma geração encontrada</h3>
                    <p className="mt-1 text-sm text-gray-500">Ajuste os filtros ou comece a criar conteúdo.</p>
                </div>
            ) : (
                <div className="bg-black border border-[#136c0b]/30 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3">Modelo IA</th>
                                    <th className="px-6 py-3">Prompt</th>
                                    <th className="px-6 py-3 text-center">Créditos</th>
                                    <th className="px-6 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedHistory.map(item => (
                                    <React.Fragment key={item.id}>
                                        <tr className="bg-black border-b border-gray-800 hover:bg-gray-900/50">
                                            <td className="px-6 py-4 text-xs">{item.createdAt}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(item.generationType)}`}>{item.generationType.replace(/_/g, ' ')}</span></td>
                                            <td className="px-6 py-4 text-xs font-mono">{item.aiModel}</td>
                                            <td className="px-6 py-4 text-gray-300 max-w-xs truncate">{item.promptSummary}</td>
                                            <td className="px-6 py-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-mono bg-yellow-900/50 text-yellow-300">{item.creditsUsed}</span></td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => toggleItem(item.id)} className="text-blue-400 hover:text-blue-300" title="Visualizar Detalhes"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                                                    <button onClick={() => handleCopyResult(item.result)} className="text-green-400 hover:text-green-300" title="Copiar Resultado"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedItem === item.id && (
                                            <tr className="bg-gray-900/30">
                                                <td colSpan={6} className="p-4">
                                                    <HistoryDetailView item={item} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {totalPages > 1 && (
                        <div className="p-4 flex justify-center items-center gap-2 text-sm">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50">Anterior</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded ${currentPage === page ? 'bg-[#1b8a0f] text-white' : 'bg-gray-800'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50">Próxima</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GenerationHistory;
