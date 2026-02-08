
import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import { UserRole, Cell } from '../types';
import { ADMIN_PASSWORD } from '../constants';

interface LoginProps {
  onLogin: (role: UserRole, cell: Cell | null) => void;
  cells: Cell[];
}

const Login: React.FC<LoginProps> = ({ onLogin, cells }) => {
  const [role, setRole] = useState<UserRole>('leader');
  const [password, setPassword] = useState('');
  const [selectedCellId, setSelectedCellId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    
    if (role === 'admin') {
      if (password === ADMIN_PASSWORD) {
        onLogin('admin', null);
      } else {
        setError('Senha incorreta para administrador.');
      }
    } else {
      if (!selectedCellId) {
        setError('Selecione uma célula para acessar.');
        return;
      }
      const cell = cells.find(c => c.id === selectedCellId);
      onLogin('leader', cell || null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] font-sans p-6">
      <div className="w-full max-w-md bg-black rounded-[2.5rem] p-8 md:p-12 relative z-10 shadow-2xl border border-white/10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-transparent mb-6 overflow-hidden">
            <img 
              src="https://lh3.googleusercontent.com/d/1zTjbN1NbTxTgtGtzhQ2ngvIyBHHxciDY" 
              alt="Logo Viver em Cristo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Gestão de Célula</h2>
          <p className="text-[#00A9B0] font-bold">Selecione seu perfil de acesso</p>
        </div>

        <div className="flex p-1.5 bg-white/5 rounded-[1.25rem] mb-8">
          <button
            onClick={() => { setRole('leader'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all duration-300 ${role === 'leader' ? 'bg-secondary text-primary shadow-sm font-bold scale-[1.02]' : 'text-gray-400 font-medium hover:text-gray-200'}`}
          >
            <User size={18} /> Líder
          </button>
          <button
            onClick={() => { setRole('admin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all duration-300 ${role === 'admin' ? 'bg-secondary text-primary shadow-sm font-bold scale-[1.02]' : 'text-gray-400 font-medium hover:text-gray-200'}`}
          >
            <ShieldCheck size={18} /> Admin
          </button>
        </div>

        <div className="space-y-6">
          {role === 'leader' ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 ml-1">Sua Célula</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                  <Home size={18} />
                </div>
                <select
                  value={selectedCellId}
                  onChange={(e) => setSelectedCellId(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-white/5 text-white rounded-2xl border-none focus:ring-2 focus:ring-secondary/50 outline-none transition-all appearance-none font-bold"
                >
                  <option value="" className="bg-black">Escolha sua célula...</option>
                  {cells.map(cell => (
                    <option key={cell.id} value={cell.id} className="bg-black text-white">{cell.name} ({cell.leader})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 ml-1">Senha de Administrador</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha..."
                  className="w-full pl-11 pr-4 py-4 bg-white/5 text-white border-none rounded-2xl focus:ring-2 focus:ring-secondary/50 outline-none transition-all font-medium placeholder:text-gray-600"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-red-400 text-sm font-semibold bg-red-900/20 p-4 rounded-2xl flex items-center gap-2 border-none">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-6 bg-secondary hover:bg-secondary/90 text-primary rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-secondary/20 group active:scale-[0.98] ring-offset-2 ring-offset-black focus:ring-4 focus:ring-secondary/20"
          >
            Acessar Sistema 
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
            Viver em Cristo © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
