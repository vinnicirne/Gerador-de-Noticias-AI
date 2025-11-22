
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import NewsGenerator from './features/NewsGenerator';
import LandingPageGenerator from './features/LandingPageGenerator';
import CopyGenerator from './features/CopyGenerator';
import PromptGenerator from './features/PromptGenerator';
import CanvaGenerator from './features/CanvaGenerator';
import ApiIntegrations from './features/ApiIntegrations';
import IntegrationsDashboard from './features/IntegrationsDashboard';
import AdminPanel from './features/AdminPanel';
import CreditPurchase from './features/CreditPurchase';
import NotificationToast from './components/NotificationToast';
import PermissionGate from './components/PermissionGate';
import GenerationHistory from './features/GenerationHistory'; // NOVO

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState('news');

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'news':
        return <NewsGenerator />;
      case 'landing-page':
        return <LandingPageGenerator />;
      case 'copy':
        return <CopyGenerator />;
      case 'canva':
        return <CanvaGenerator />;
      case 'prompts':
        return <PromptGenerator />;
      case 'history': // NOVA ROTA
        return <GenerationHistory />;
      case 'api-integrations':
        return <ApiIntegrations />;
      case 'integrations':
        return <IntegrationsDashboard />;
      case 'credits':
        return <CreditPurchase />;
      case 'admin':
        return (
            <PermissionGate 
                requiredRole="admin" 
                onAccessDenied={() => setActiveTool('news')}
            >
                <AdminPanel />
            </PermissionGate>
        );
      default:
        return <NewsGenerator />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-300 font-sans">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto relative">
          {renderActiveTool()}
          <NotificationToast />
      </main>
    </div>
  );
};

export default App;
