
import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { PaymentConfig, PaymentPlatform, CreditPackage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { notificationService } from '../services/notificationService';

const PaymentSettings: React.FC = () => {
    const [configs, setConfigs] = useState<PaymentConfig[]>([]);
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setConfigs(paymentService.getConfigs());
        setPackages(paymentService.getCreditPackages());
    }, []);

    const handleTogglePlatform = (platform: PaymentPlatform) => {
        const newConfigs = configs.map(c => ({
            ...c,
            isActive: c.platform === platform ? !c.isActive : c.isActive,
        }));
        setConfigs(newConfigs);
    };

    const handleConfigChange = (platform: PaymentPlatform, field: keyof PaymentConfig, value: string) => {
        const newConfigs = configs.map(c => 
            c.platform === platform ? { ...c, [field]: value } : c
        );
        setConfigs(newConfigs);
    };

    const handlePackageChange = (id: string, field: keyof CreditPackage, value: string | number | boolean) => {
        const newPackages = packages.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        );
        setPackages(newPackages);
    };

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            paymentService.saveConfigs(configs);
            paymentService.saveCreditPackages(packages);
            setIsLoading(false);
            notificationService.notify('Configurações salvas com sucesso!', 'success');
        }, 800);
    };

    return (
        <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-[#136c0b]/30 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Financeiro & Pagamentos</h3>
                    <p className="text-sm text-gray-400">Gerencie gateways de pagamento e pacotes de crédito.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#1b8a0f] text-white rounded hover:bg-[#24a813] disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading && <LoadingSpinner className="h-4 w-4 text-white" />}
                    Salvar Tudo
                </button>
            </div>
            
            <div className="p-6 space-y-8">
                {/* Gateways Section */}
                <div>
                    <h4 className="text-lg font-bold text-white mb-4">Gateways de Pagamento</h4>
                    {configs.map((config) => (
                        <div key={config.platform} className={`p-6 rounded-xl border mb-4 ${config.isActive ? 'border-[#1b8a0f]/50 bg-[#1b8a0f]/5' : 'border-gray-800 bg-gray-900/30'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${config.isActive ? 'bg-[#1b8a0f] shadow-[0_0_8px_#1b8a0f]' : 'bg-gray-600'}`}></div>
                                    <h4 className="text-xl font-bold text-white capitalize">{config.platform === 'mercadopago' ? 'Mercado Pago' : 'Stripe'}</h4>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={config.isActive} onChange={() => handleTogglePlatform(config.platform)} />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1b8a0f]"></div>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Public Key</label>
                                    <input type="text" value={config.publicKey} onChange={(e) => handleConfigChange(config.platform, 'publicKey', e.target.value)} className="w-full bg-black border border-gray-700 rounded p-2 text-gray-300 text-sm font-mono focus:border-[#1b8a0f] focus:outline-none" placeholder={config.platform === 'mercadopago' ? 'TEST-...' : 'pk_test_...'} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Access Token / Secret Key</label>
                                    <input type="password" value={config.accessToken} onChange={(e) => handleConfigChange(config.platform, 'accessToken', e.target.value)} className="w-full bg-black border border-gray-700 rounded p-2 text-gray-300 text-sm font-mono focus:border-[#1b8a0f] focus:outline-none" placeholder={config.platform === 'mercadopago' ? 'APP_USR-...' : 'sk_test_...'} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Credit Packages Section */}
                <div>
                    <h4 className="text-lg font-bold text-white mb-4">Pacotes de Crédito</h4>
                    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-black/50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Nome</th>
                                    <th className="px-4 py-3 text-center">Créditos</th>
                                    <th className="px-4 py-3 text-center">Preço (R$)</th>
                                    <th className="px-4 py-3 text-center">Ordem</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                {packages.map((pkg) => (
                                    <tr key={pkg.id} className="border-t border-gray-800">
                                        <td className="p-2"><input type="text" value={pkg.name} onChange={(e) => handlePackageChange(pkg.id, 'name', e.target.value)} className="w-full bg-transparent p-2 rounded focus:bg-black focus:outline-none focus:ring-1 focus:ring-[#1b8a0f]" /></td>
                                        <td className="p-2"><input type="number" value={pkg.credits} onChange={(e) => handlePackageChange(pkg.id, 'credits', Number(e.target.value))} className="w-20 text-center bg-transparent p-2 rounded focus:bg-black focus:outline-none focus:ring-1 focus:ring-[#1b8a0f]" /></td>
                                        <td className="p-2"><input type="number" step="0.01" value={pkg.price} onChange={(e) => handlePackageChange(pkg.id, 'price', Number(e.target.value))} className="w-24 text-center bg-transparent p-2 rounded focus:bg-black focus:outline-none focus:ring-1 focus:ring-[#1b8a0f]" /></td>
                                        <td className="p-2"><input type="number" value={pkg.order} onChange={(e) => handlePackageChange(pkg.id, 'order', Number(e.target.value))} className="w-16 text-center bg-transparent p-2 rounded focus:bg-black focus:outline-none focus:ring-1 focus:ring-[#1b8a0f]" /></td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => handlePackageChange(pkg.id, 'isActive', !pkg.isActive)} className={`px-3 py-1 rounded-full text-xs font-medium ${pkg.isActive ? 'bg-[#1b8a0f]/20 text-[#1b8a0f]' : 'bg-red-900/20 text-red-400'}`}>
                                                {pkg.isActive ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSettings;
