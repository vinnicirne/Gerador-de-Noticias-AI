
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NewsGeneratorForm from './components/NewsGeneratorForm';
import UpgradeModal from './components/UpgradeModal';
import CheckoutModal from './components/CheckoutModal';
import Documentation from './components/Documentation';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';
import { generateNewsArticle } from './services/geminiService';
import { authService } from './services/authService';
import { supabase } from './services/supabase';
import type { GeneratedNews, PlanConfig, AppConfig, User } from './types';
import { NEWS_THEMES, NEWS_TONES } from './constants';

// --- CONSTANTS ---

const INITIAL_PLANS: PlanConfig[] = [
  { 
    id: 'p_free', 
    name: 'Gratuito', 
    price: 0, 
    credits: 3, 
    recurrence: 'Mensal', 
    features: ['Grounding: Incluso', 'Tons: Padrão (4)', 'Suporte: FAQ'], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_basic', 
    name: 'Básico', 
    price: 99.00, 
    credits: 50, 
    recurrence: 'Mensal', 
    features: ['Grounding: Incluso', 'Tons: Todos', 'Custo/Crédito: R$ 1,98'], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_pro', 
    name: 'Profissional', 
    price: 349.00, 
    credits: 200, 
    recurrence: 'Mensal', 
    features: ['Prioridade', 'Suporte 24h', 'Custo/Crédito: R$ 1,74'], 
    active: true,
    recommended: true
  }
];

const DEFAULT_CONFIG: AppConfig = {
  appName: 'Gerador de Notícias',
  logoUrl: '',
  supportEmail: 'suporte@newsai.com',
  whatsappNumber: '5511999999999',
  contactMessage: 'Olá, preciso de ajuda com a plataforma.'
};

// --- UTILS ---
const LoadingState: React.FC = () => (
    <div className="flex flex-col justify-center items-center p-12 animate-fade-in">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-green-400 font-mono text-sm animate-pulse">Conectando Neural Link...</p>
    </div>
);

// --- MAIN COMPONENT ---
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'app' | 'login' | 'register' | 'user-dashboard' | 'admin-dashboard' | 'docs' | 'admin-docs'>('app');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [theme, setTheme] = useState<string>(NEWS_THEMES[0]);
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>(NEWS_TONES[0]);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);
  
  // Credits & History are now derived from user state or fetched
  const [credits, setCredits] = useState<number>(0);
  const [history, setHistory] = useState<GeneratedNews[]>([]);

  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanConfig | null>(null);

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
      const initAuth = async () => {
          setIsAuthLoading(true);
          try {
              // Check if supabase is configured (avoid crash if placeholder)
              if ((supabase as any).supabaseUrl === 'https://placeholder.supabase.co') {
                 console.warn("Supabase não configurado. Modo offline/demo limitado.");
                 setIsAuthLoading(false);
                 return;
              }

              const sessionUser = await authService.getCurrentSession();
              if (sessionUser) {
                  setUser(sessionUser);
                  setCredits(sessionUser.credits);
              }
          } catch (error) {
              console.error("Erro ao restaurar sessão:", error);
          } finally {
              setIsAuthLoading(false);
          }
      };
      initAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT') {
              setUser(null);
              setCredits(0);
              setCurrentView('login');
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
               if (session?.user) {
                   const refreshedUser = await authService.getCurrentSession();
                   if (refreshedUser) {
                       setUser(refreshedUser);
                       setCredits(refreshedUser.credits);
                   }
               }
          }
      });

      return () => subscription.unsubscribe();
  }, []);

  // Load History when user logs in
  useEffect(() => {
      const fetchHistory = async () => {
          if (!user) {
              setHistory([]);
              return;
          }
          
          // Evitar chamada se for placeholder
          if ((supabase as any).supabaseUrl === 'https://placeholder.supabase.co') return;

          const { data, error } = await supabase
              .from('historico_prompts')
              .select('*')
              .eq('user_id', user.id)
              .order('timestamp', { ascending: false })
              .limit(10);
          
          if (data) {
              const mappedHistory = data.map((h: any) => ({
                  ...h.response_json,
                  id: h.id,
                  created_at: h.timestamp
              }));
              setHistory(mappedHistory);
              if (!generatedNews && mappedHistory.length > 0) {
                  setGeneratedNews(mappedHistory[0]);
              }
          }
      };
      fetchHistory();
  }, [user]);

  const handleGenerateNews = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
        setCurrentView('login');
        return;
    }

    if (credits <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedNews(null);

    try {
      const news = await generateNewsArticle(theme, topic, tone);
      
      setGeneratedNews(news);
      setHistory(prev => [news, ...prev]);
      setCredits(prev => prev - 1);
      
      if (user) setUser({...user, credits: credits - 1});
      
    } catch (err) {
      if (err instanceof Error) {
          if (err.message.includes('Saldo insuficiente')) {
               setShowUpgradeModal(true);
          }
          setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData: User) => {
      setUser(userData);
      setCredits(userData.credits);
      if (userData.role === 'admin') {
          setCurrentView('admin-dashboard');
      } else {
          setCurrentView('app');
      }
  };

  const handleLogout = async () => {
      await authService.logout();
      setCurrentView('login');
  };

  const handleUpgrade = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
        setCheckoutPlan(selectedPlan);
        setShowUpgradeModal(false);
        setShowCheckoutModal(true);
    }
  };

  const handlePaymentSuccess = async () => {
      if (!checkoutPlan || !user) return;
      
      const newTotal = credits + checkoutPlan.credits;
      
      // Update Supabase
      await supabase
        .from('usuarios')
        .update({ creditos_saldo: newTotal })
        .eq('id', user.id);

      setCredits(newTotal);
      setUser({...user, credits: newTotal});
      setShowCheckoutModal(false);
      setCheckoutPlan(null);
      alert("Pagamento Confirmado! Seus créditos foram adicionados.");
  };

  // --- VIEWS RENDER ---

  if (isAuthLoading) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center">
              <LoadingState />
          </div>
      );
  }

  if (currentView === 'login') {
      return (
        <Login 
            onLoginSuccess={handleLoginSuccess} 
            onGoToRegister={() => setCurrentView('register')} 
            onBack={() => setCurrentView('app')}
        />
      );
  }

  if (currentView === 'register') {
      return <Register onRegisterSuccess={handleLoginSuccess} onGoToLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'user-dashboard') {
      return (
          <>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgrade} plans={plans} appConfig={appConfig} />
            <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} plan={checkoutPlan} onConfirm={handlePaymentSuccess} />
            <UserDashboard 
                credits={credits}
                history={history}
                onBack={() => setCurrentView('app')}
                onOpenPro={() => setShowUpgradeModal(true)}
                onOpenAdmin={() => user?.role === 'admin' && setCurrentView('admin-dashboard')}
            />
          </>
      );
  }

  if (currentView === 'admin-dashboard') {
      if (user?.role !== 'admin') {
          setCurrentView('app'); // Protect route
          return null;
      }
      return (
          <AdminDashboard 
              onBack={() => setCurrentView('app')}
              onOpenDocs={() => setCurrentView('admin-docs')}
              currentUserCredits={credits}
              onUpdateUserCredits={setCredits}
              plans={plans}
              onUpdatePlans={setPlans}
              appConfig={appConfig}
              onUpdateAppConfig={setAppConfig}
          />
      );
  }

  if (currentView === 'docs') return <Documentation mode="user" onBack={() => setCurrentView('app')} />;
  if (currentView === 'admin-docs') return <Documentation mode="admin" onBack={() => setCurrentView('admin-dashboard')} />;

  // Main App View
  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 pb-20">
       <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgrade} plans={plans} appConfig={appConfig} />
       <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} plan={checkoutPlan} onConfirm={handlePaymentSuccess} />

      <div className="w-full max-w-4xl relative z-10">
        <div className="flex items-center justify-end mb-2 gap-2">
             {user ? (
                 <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-500">Olá, {user.name}</span>
                     <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 underline">Sair</button>
                 </div>
             ) : (
                 <button onClick={() => setCurrentView('login')} className="text-xs text-green-400 hover:underline">Entrar</button>
             )}
        </div>

        <Header 
            credits={credits} 
            onOpenPro={() => setShowUpgradeModal(true)} 
            onOpenDocs={() => setCurrentView('docs')}
            onOpenProfile={() => user ? setCurrentView('user-dashboard') : setCurrentView('login')}
            appConfig={appConfig}
        />
        
        <main className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 items-start">
             <div className="md:col-span-2">
                <NewsGeneratorForm
                    theme={theme}
                    setTheme={setTheme}
                    topic={topic}
                    setTopic={setTopic}
                    tone={tone}
                    setTone={setTone}
                    onSubmit={handleGenerateNews}
                    isLoading={isLoading}
                    credits={credits}
                    onOpenPro={() => setShowUpgradeModal(true)}
                    onLoginRequired={() => setCurrentView('login')}
                    isLoggedIn={!!user}
                />
             </div>
          </div>

          {/* Display Generated Content */}
          <div className="mt-8">
            {isLoading && (
                <div className="flex flex-col justify-center items-center p-12 animate-fade-in">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
                    </div>
                    <p className="text-green-400 font-mono text-lg animate-pulse">Processando IA...</p>
                </div>
            )}
            
            {error && (
              <div className="bg-red-900/10 border border-red-900 text-red-400 p-6 rounded-lg text-center shadow-lg animate-fade-in">
                <p className="font-bold mb-2">ERRO NO SISTEMA</p>
                <p className="font-mono text-sm">{error}</p>
              </div>
            )}
            
            {generatedNews && !isLoading && (
                 // Pass simple component for display
                 <div className="w-full max-w-4xl mx-auto mt-8 space-y-8 animate-fade-in">
                    <article className="bg-black/60 rounded-xl shadow-2xl overflow-hidden border border-green-900/50 p-8">
                        <h1 className="text-3xl font-bold text-white mb-4">{generatedNews.title}</h1>
                        <div className="text-gray-300 whitespace-pre-wrap">{generatedNews.body}</div>
                        {generatedNews.imagePrompt && (
                            <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-800">
                                <span className="text-xs font-bold text-green-500 uppercase">Image Prompt:</span>
                                <p className="text-xs text-gray-400 font-mono mt-1">{generatedNews.imagePrompt}</p>
                            </div>
                        )}
                    </article>
                 </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
