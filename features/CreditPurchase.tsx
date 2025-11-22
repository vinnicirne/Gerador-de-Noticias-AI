
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { CREDIT_PACKAGES } from '../constants';
import { UserProfile, CreditHistoryItem, CreditPackage } from '../types';
import CheckoutModal from '../components/CheckoutModal';

const CreditPurchase: React.FC = () => {
    const [user, setUser] = useState<UserProfile>(userService.getUser());
    const [history, setHistory] = useState<CreditHistoryItem[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = userService.subscribe(setUser);
        setHistory(userService.getHistory());
        return unsubscribe;
    }, []);

    useEffect(() => {
        setHistory(userService.getHistory());
    }, [user]);

    const handlePurchaseClick = (pkg: CreditPackage) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPackage(null);
    };

    return (
        <div className="animate-fade-in space-y-8">
             <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)]">
                <h1 className="text-2xl font-bold text-white mb-2">Meus Créditos</h1>
                <p className="text-gray-400 text-sm">Gerencie seu saldo e recarregue para continuar gerando conteúdo.</p>
                
                <div className="mt-6 flex items-center justify-between bg-[#1b8a0f]/10 border border-[#1b8a0f]/30 p-6 rounded-lg">
                    <div>
                        <p className="text-xs text-[#1b8a0f] uppercase font-bold tracking-wider">Saldo Atual</p>
                        <h2 className="text-4xl font-bold text-white mt-1">{user.credits} <span className="text-lg text-gray-500 font-normal">créditos</span></h2>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Plano: <span className="text-white font-bold capitalize">{user.userType}</span></p>
                        <p className="text-xs text-gray-500">Usuário desde 2024</p>
                    </div>
                </div>
             </div>

             {/* Packages */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CREDIT_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 hover:border-[#1b8a0f]/50 transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white capitalize">{pkg.id} Pack</h3>
                        <div className="my-4">
                            <span className="text-3xl font-bold text-[#1b8a0f]">{pkg.credits}</span>
                            <span className="text-gray-400 ml-2">créditos</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">R$ {pkg.price.toFixed(2).replace('.', ',')}</p>
                        
                        <button
                            onClick={() => handlePurchaseClick(pkg)}
                            className="w-full py-2 px-4 rounded bg-white text-black font-bold hover:bg-gray-200 transition-colors flex justify-center items-center"
                        >
                            Comprar Agora
                        </button>
                    </div>
                ))}
             </div>

             {/* Transaction History */}
             <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 overflow-hidden">
                <div className="p-6 border-b border-[#136c0b]/30">
                    <h3 className="text-lg font-bold text-white">Histórico de Transações</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Descrição</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item.id} className="bg-black border-b border-gray-800 hover:bg-gray-900/50">
                                    <td className="px-6 py-4">{item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 font-medium text-white">{item.description}</td>
                                    <td className="px-6 py-4 capitalize">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            item.type === 'purchase' || item.type === 'bonus' 
                                            ? 'bg-green-900/30 text-green-400' 
                                            : 'bg-red-900/30 text-red-400'
                                        }`}>
                                            {item.type === 'purchase' ? 'Compra' : item.type === 'bonus' ? 'Bônus' : 'Uso'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount}
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                        Nenhuma transação registrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>

             {/* Checkout Modal */}
             <CheckoutModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                selectedPackage={selectedPackage} 
             />
        </div>
    );
};

export default CreditPurchase;
