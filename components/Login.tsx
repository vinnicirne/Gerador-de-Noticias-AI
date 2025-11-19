
import React, { useState } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onGoToRegister: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToRegister, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // O role é determinado automaticamente pelo banco de dados agora
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao autenticar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md border border-green-900/50 rounded-2xl p-8 shadow-2xl bg-gray-900/20 backdrop-blur-sm relative z-10">
        
        <button onClick={onBack} className="absolute top-4 left-4 text-xs text-gray-500 hover:text-white">← Voltar</button>

        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">Gerador de Notícias <span className="text-green-500">AI</span></h1>
          <p className="text-gray-400 text-sm mt-2">Entre para acessar seus créditos e histórico.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
              <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-xs p-3 rounded text-center">
                  {error}
              </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-green-900/30 rounded-lg px-4 py-3 text-gray-200 outline-none focus:border-green-500 transition"
                required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-green-900/30 rounded-lg px-4 py-3 text-gray-200 outline-none focus:border-green-500 transition"
                required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3.5 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Verificando Credenciais...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-green-900/30">
            <p className="text-sm text-gray-500">
                Não tem uma conta?{' '}
                <button onClick={onGoToRegister} className="text-green-400 hover:text-green-300 font-bold hover:underline">
                Criar conta gratuita
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
