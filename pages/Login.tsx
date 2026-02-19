import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, Home, Eye, EyeOff, Layers, Baby, Sparkles, Users, ChevronLeft } from 'lucide-react';
import { UserRole, Cell, CellType } from '../types';
import { ADMIN_PASSWORD } from '../constants';

interface LoginProps {
  onLogin: (role: UserRole, cell: Cell | null, rememberMe?: boolean) => void;
  cells: Cell[];
}

const Login: React.FC<LoginProps> = ({ onLogin, cells }) => {
  const [role, setRole] = useState<UserRole>('leader');
  const [step, setStep] = useState(0); // 0: Select Role, 1: Select Type, 2: Select Cell
  const [selectedType, setSelectedType] = useState<CellType | ''>('');
  const [password, setPassword] = useState('');
  const [selectedCellId, setSelectedCellId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');

    if (role === 'admin') {
      if (password === ADMIN_PASSWORD) {
        onLogin('admin', null, rememberMe);
      } else {
        setError('Senha incorreta para administrador.');
      }
    } else {
      if (step === 0) {
        setStep(1);
      } else if (step === 1) {
        if (!selectedType) {
          setError('Escolha o tipo de célula.');
          return;
        }
        setStep(2);
      } else {
        if (!selectedCellId) {
          setError('Selecione uma célula para acessar.');
          return;
        }
        const cell = cells.find(c => c.id === selectedCellId);
        onLogin('leader', cell || null);
      }
    }
  };

  const filteredCells = cells.filter(c => selectedType === '' || c.type === selectedType);

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
          <p className="text-[#00A9B0] font-bold">
            {role === 'admin' ? 'Acesso Administrativo' : step === 1 ? 'Qual o tipo da célula?' : step === 2 ? 'Agora selecione sua célula' : 'Selecione seu perfil de acesso'}
          </p>
        </div>

        {step === 0 && (
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
        )}

        <div className="space-y-6">
          {role === 'leader' ? (
            <div className="space-y-4">
              {step === 1 ? (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {[
                    { id: 'Adulto', label: 'Adulto', icon: <Users size={20} /> },
                    { id: 'Jovem', label: 'Jovem', icon: <Sparkles size={20} /> },
                    { id: 'Juvenil', label: 'Juvenil', icon: <User size={20} /> },
                    { id: 'Kids', label: 'Kids', icon: <Baby size={20} /> }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id as CellType); setError(''); }}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 ${selectedType === type.id ? 'bg-secondary/10 border-secondary text-secondary shadow-lg shadow-secondary/10' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                    >
                      <div className={`p-3 rounded-2xl ${selectedType === type.id ? 'bg-secondary text-primary' : 'bg-white/5'}`}>
                        {type.icon}
                      </div>
                      <span className="font-black uppercase text-[10px] tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              ) : step === 2 ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <label className="text-sm font-bold text-gray-400 ml-1">Sua Célula ({selectedType})</label>
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
                      {filteredCells.map(cell => (
                        <option key={cell.id} value={cell.id} className="bg-black text-white">{cell.name} ({cell.leader})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-secondary/20 shadow-lg">
                    <User size={32} />
                  </div>
                  <p className="text-gray-400 font-bold text-sm">Clique no botão abaixo para iniciar</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1">Senha de Administrador</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    className="w-full pl-11 pr-12 py-4 bg-white/5 text-white border-none rounded-2xl focus:ring-2 focus:ring-secondary/50 outline-none transition-all font-medium placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 bg-white/5 border border-white/10 rounded-md peer-checked:bg-secondary peer-checked:border-secondary transition-all"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-primary scale-0 peer-checked:scale-100 transition-transform">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-widest">Manter conectado</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-red-400 text-sm font-semibold bg-red-900/20 p-4 rounded-2xl flex items-center gap-2 border-none text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {role === 'leader' && step > 0 && (
              <button
                onClick={() => { setStep(prev => prev - 1); setError(''); }}
                className="p-6 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl transition-all active:scale-[0.95]"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <button
              onClick={handleLogin}
              className="flex-1 py-6 bg-secondary hover:bg-secondary/90 text-primary rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-secondary/20 group active:scale-[0.98] ring-offset-2 ring-offset-black focus:ring-4 focus:ring-secondary/20"
            >
              {role === 'leader' && step < 2 ? 'Continuar' : 'Acessar Sistema'}
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
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
