import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { AdminDashboardData, AdminUser, BillingTransaction, AdminChartData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentSettings from '../components/PaymentSettings';
import AIPlatformSettings from '../components/AIPlatformSettings';
import { SYSTEM_STATUS } from '../constants';

type AdminTab = 'dashboard' | 'users' | 'billing' | 'activity' | 'finance_settings' | 'multi_ai';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [billing, setBilling] = useState<BillingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula delay de carregamento do "backend"
    setTimeout(() => {
      setDashboardData(adminService.getDashboardData());
      setUsers(adminService.getUsers());
      setBilling(adminService.getBilling());
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading || !dashboardData) {
    return (
        <div className="flex items-center justify-center h-full">
            <LoadingSpinner className="h-12 w-12 text-[#1b8a0f]" />
        </div>
    );
  }

  // Componente de Gráfico Simples (CSS Bar Chart)
  const SimpleBarChart: React.FC<{ data: AdminChartData }> = ({ data }) => {
      const maxVal = Math.max(...data.userRegistrations, ...data.newsGenerated, 10); 
      
      return (
          <div className="w-full h-64 flex items-end justify-between gap-2 pt-6">
              {data.dates.map((date, index) => {
                  const userHeight = (data.userRegistrations[index] / maxVal) * 100;
                  const newsHeight = (data.newsGenerated[index] / maxVal) * 100;
                  
                  return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end relative">
                          {/* Tooltip */}
                          <div className="absolute -top-8 bg-gray-900 border border-gray-700 text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
                              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#1b8a0f] rounded-full"></div> Notícias: {data.newsGenerated[index]}</div>
                              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Usuários: {data.userRegistrations[index]}</div>
                          </div>

                          <div className="w-full flex gap-1 items-end justify-center h-full">
                              <div 
                                  className="w-1/2 bg-[#1b8a0f] rounded-t opacity-80 hover:opacity-100 transition-all"
                                  style={{ height: `${Math.max(newsHeight, 5)}%` }}
                              ></div>
                              <div 
                                  className="w-1/2 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-all"
                                  style={{ height: `${Math.max(userHeight, 5)}%` }}
                              ></div>
                          </div>
                          <span className="text-[10px] text-gray-500 mt-2">{date}</span>
                      </div>
                  )
              })}
          </div>
      )
  };

  // Widget de Checklist e Guia
  const SystemStatusWidget = () => (
    <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)] h-full">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-[#136c0b]/30 pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Guia do Sistema & Status
        </h3>

        <div className="mb-6 bg-[#1b8a0f]/10 border border-[#1b8a0f]/30 rounded-lg p-3 flex items-center justify-between">
            <div>
                <p className="text-xs text-[#1b8a0f] font-bold uppercase tracking-wider">Versão Atual</p>
                <p className="text-white font-mono font-bold">{SYSTEM_STATUS.versao}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1b8a0f] text-white">
                PRODUÇÃO
            </span>
        </div>

        <div className="space-y-6">
            {/* Como Usar */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Acesso Rápido</h4>
                <ul className="space-y-2 text-sm font-mono bg-gray-900/50 p-3 rounded border border-gray-800">
                    <li className="flex items-center gap-2 group cursor-pointer hover:text-[#1b8a0f] transition-colors" onClick={() => setActiveTab('users')}>
                        <span className="text-blue-500">VIEW</span>
                        <span className="text-gray-300 group-hover:text-white">Usuários</span> 
                        <span className="text-gray-600 text-xs ml-auto">Auth</span>
                    </li>
                    <li className="flex items-center gap-2 group cursor-pointer hover:text-[#1b8a0f] transition-colors" onClick={() => setActiveTab('multi_ai')}>
                        <span className="text-blue-500">CONF</span>
                        <span className="text-gray-300 group-hover:text-white">Multi-IA</span> 
                        <span className="text-gray-600 text-xs ml-auto">Models</span>
                    </li>
                    <li className="flex items-center gap-2 group cursor-pointer hover:text-[#1b8a0f] transition-colors" onClick={() => setActiveTab('finance_settings')}>
                        <span className="text-blue-500">CONF</span>
                        <span className="text-gray-300 group-hover:text-white">Financeiro</span> 
                        <span className="text-gray-600 text-xs ml-auto">Billing</span>
                    </li>
                </ul>
            </div>

            {/* Funcionalidades Implementadas */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Módulos Ativos</h4>
                <ul className="space-y-2">
                    {[
                        'Sistema Multi-IA & Orchestrator',
                        'Histórico de Gerações Completo',
                        'Integração Mercado Pago (Sim.)',
                        'Controle de Créditos & Logs',
                        'SEO Avançado & Analytics',
                        'Painel Admin Dashboard'
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                            <div className="w-5 h-5 rounded-full bg-[#1b8a0f]/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-[#1b8a0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard do Sistema</h1>
                <p className="text-gray-400 text-sm mt-1">Visão geral da operação v{SYSTEM_STATUS.versao}</p>
            </div>
            <span className="text-xs text-gray-500 font-mono">Build: {new Date().toLocaleDateString()}</span>
        </div>

        {/* Stats Grid - Ordem Exata do Template Solicitado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. Total de Usuários */}
            <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)] flex flex-col justify-between">
                <div>
                    <div className="text-4xl font-bold text-white mb-2">{dashboardData.totalUsers}</div>
                    <div className="text-sm text-gray-400 uppercase font-bold tracking-wider">Total de Usuários</div>
                </div>
                <div className="mt-4 w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full" style={{ width: '100%' }}></div>
                </div>
            </div>

            {/* 2. Usuários Ativos */}
            <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)] flex flex-col justify-between">
                <div>
                    <div className="text-4xl font-bold text-white mb-2">{dashboardData.activeUsers}</div>
                    <div className="text-sm text-gray-400 uppercase font-bold tracking-wider">Usuários Ativos</div>
                </div>
                <div className="mt-4 w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(dashboardData.activeUsers / dashboardData.totalUsers) * 100}%` }}></div>
                </div>
            </div>

            {/* 3. Créditos em Circulação */}
            <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)] flex flex-col justify-between">
                <div>
                    <div className="text-4xl font-bold text-white mb-2">{dashboardData.totalCredits}</div>
                    <div className="text-sm text-gray-400 uppercase font-bold tracking-wider">Créditos em Circulação</div>
                </div>
                <div className="mt-4 w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: '75%' }}></div>
                </div>
            </div>

            {/* 4. Faturamento Total */}
            <div className="bg-black border border-[#136c0b]/30 p-6 rounded-xl shadow-[0_0_10px_rgba(27,138,15,0.2)] flex flex-col justify-between">
                <div>
                    <div className="text-4xl font-bold text-[#1b8a0f] mb-2">R$ {dashboardData.totalRevenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-400 uppercase font-bold tracking-wider">Faturamento Total</div>
                </div>
                <div className="mt-4 w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#1b8a0f] h-full" style={{ width: '100%' }}></div>
                </div>
            </div>
        </div>

        {/* Analytics Chart Section */}
        <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Analytics (Últimos 7 dias)</h3>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#1b8a0f] rounded"></div> Notícias Geradas</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div> Novos Usuários</div>
                </div>
            </div>
            <SimpleBarChart data={dashboardData.chartData} />
        </div>

        {/* Grid Inferior: Atividades e Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Atividades Recentes */}
            <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-[#136c0b]/30">
                    <h3 className="text-lg font-bold text-white">Atividades Recentes</h3>
                </div>
                <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                    {dashboardData.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-white">{activity.user}</span>
                                <span className="text-gray-500">-</span>
                                <span className="text-gray-300">{activity.action}</span>
                            </div>
                            <span className="text-sm text-gray-500">{activity.timestamp}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Novo Widget de Checklist */}
            <SystemStatusWidget />
        </div>
    </div>
  );

  const renderUsers = () => (
      <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-[#136c0b]/30 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Gestão de Usuários</h3>
            <button className="px-4 py-2 bg-[#1b8a0f] text-white rounded text-sm hover:bg-[#24a813]">Novo Usuário</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-3">Usuário</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Tipo</th>
                        <th className="px-6 py-3">Créditos</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Último Login</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="bg-black border-b border-gray-800 hover:bg-gray-900/50">
                            <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs ${user.userType === 'admin' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-300'}`}>
                                    {user.userType}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono">{user.credits}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                    {user.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">{user.lastLogin}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderBilling = () => (
    <div className="bg-gray-900/20 rounded-xl border border-[#136c0b]/30 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-[#136c0b]/30 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Relatório de Faturamento</h3>
            <button className="text-sm text-[#1b8a0f] hover:underline">Exportar CSV</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-3">ID Transação</th>
                        <th className="px-6 py-3">Usuário</th>
                        <th className="px-6 py-3">Valor</th>
                        <th className="px-6 py-3">Método</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Data</th>
                    </tr>
                </thead>
                <tbody>
                    {billing.map((tx) => (
                        <tr key={tx.id} className="bg-black border-b border-gray-800 hover:bg-gray-900/50">
                             <td className="px-6 py-4 font-mono text-xs">{tx.id}</td>
                            <td className="px-6 py-4 font-medium text-white">{tx.user}</td>
                            <td className="px-6 py-4 text-[#1b8a0f] font-bold">R$ {tx.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 capitalize">{tx.paymentMethod.replace('_', ' ')}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    tx.status === 'paid' ? 'bg-green-900/20 text-green-400' : 
                                    tx.status === 'pending' ? 'bg-yellow-900/20 text-yellow-500' : 
                                    'bg-red-900/20 text-red-400'
                                }`}>
                                    {tx.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">{tx.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white">Painel de Administração</h1>
                <p className="text-gray-400 text-sm">Gestão completa do sistema GDN_IA</p>
            </div>
            <div className="flex bg-black border border-[#136c0b]/30 rounded-lg p-1 flex-wrap">
                {(['dashboard', 'users', 'billing', 'finance_settings', 'multi_ai', 'activity'] as AdminTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === tab 
                            ? 'bg-[#1b8a0f] text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab === 'finance_settings' ? 'Pagamentos' : tab === 'multi_ai' ? 'Sistema Multi-IA' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'billing' && renderBilling()}
            {activeTab === 'finance_settings' && <PaymentSettings />}
            {activeTab === 'multi_ai' && <AIPlatformSettings />}
            {activeTab === 'activity' && renderDashboard()} 
        </div>
    </div>
  );
};

export default AdminPanel;