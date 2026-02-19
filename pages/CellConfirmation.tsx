
import React from 'react';
import { User, Home, Users, MapPin, GraduationCap, PenTool, CheckCircle, ArrowLeft, Briefcase, Layers, Clock } from 'lucide-react';
import { Cell } from '../types';

interface CellConfirmationProps {
  cell: Cell;
  onConfirm: () => void;
  onBack: () => void;
}

const CellConfirmation: React.FC<CellConfirmationProps> = ({ cell, onConfirm, onBack }) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Jovem': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Juvenil': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Elementos Decorativos de Fundo suavizados */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 border-none animate-in fade-in zoom-in-95 duration-700">

        {/* Header - Identidade Visual Refinada */}
        <div className="bg-primary p-8 md:p-12 text-center relative flex flex-col items-center">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 md:top-8 md:left-8 text-gray-400 hover:text-secondary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="relative mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-transparent flex items-center justify-center overflow-hidden group">
              {cell.leaderPhoto ? (
                <img
                  src={cell.leaderPhoto}
                  alt={cell.leader}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500 rounded-[2rem] shadow-2xl border-4 border-white/10"
                />
              ) : (
                <img
                  src="https://lh3.googleusercontent.com/d/1zTjbN1NbTxTgtGtzhQ2ngvIyBHHxciDY"
                  alt="Logo Viver em Cristo"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            {/* Badge de Tipo posicionado de forma limpa abaixo do ícone */}
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-lg ${getTypeStyles(cell.type)}`}>
              Célula {cell.type}
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase leading-tight mt-6">
            {cell.name}
          </h1>
          <div className="inline-block px-6 py-2 bg-secondary/20 rounded-full border border-secondary/30">
            <p className="text-secondary font-black text-xs md:text-sm uppercase tracking-widest">
              Líder: {cell.leader}
            </p>
          </div>
        </div>

        {/* Grid de Informações Detalhadas */}
        <div className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {/* Bloco: Anfitrião - Oculto para Kids */}
            {cell.type !== 'Kids' && (
              <div className="p-5 bg-gray-50/80 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                <div className="p-3 bg-white rounded-2xl text-secondary shadow-sm group-hover:scale-110 transition-transform"><Home size={22} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Anfitrião</p>
                  <p className="font-bold text-primary text-sm md:text-base">{cell.host || 'Não inf.'}</p>
                </div>
              </div>
            )}

            {/* Bloco: Líder Kids em Treinamento ou Normal */}
            <div className="p-5 bg-gray-50/80 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
              <div className="p-3 bg-white rounded-2xl text-secondary shadow-sm group-hover:scale-110 transition-transform"><GraduationCap size={22} /></div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{cell.type === 'Kids' ? 'Líder Kids em treinamento' : 'Líder em treinamento'}</p>
                <p className="font-bold text-primary text-sm md:text-base">{cell.trainee || 'Não inf.'}</p>
              </div>
            </div>

            {/* Bloco: Secretária ou Célula Mãe para Kids */}
            {cell.type === 'Kids' ? (
              <div className="p-5 bg-gray-50/80 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                <div className="p-3 bg-white rounded-2xl text-secondary shadow-sm group-hover:scale-110 transition-transform"><Layers size={22} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Célula Mãe (Adulto)</p>
                  <p className="font-bold text-primary text-sm md:text-base">Vinculada</p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-gray-50/80 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                <div className="p-3 bg-white rounded-2xl text-secondary shadow-sm group-hover:scale-110 transition-transform"><PenTool size={22} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Secretária</p>
                  <p className="font-bold text-primary text-sm md:text-base">{cell.secretary || 'Não inf.'}</p>
                </div>
              </div>
            )}

            {/* Bloco: Equipe - Oculto para Kids */}
            {cell.type !== 'Kids' && (
              <div className="p-5 bg-gray-50/80 rounded-3xl border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                <div className="p-3 bg-white rounded-2xl text-secondary shadow-sm group-hover:scale-110 transition-transform"><Users size={22} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Equipe</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cell.team && cell.team.length > 0 ? cell.team.map((m, i) => (
                      <span key={i} className="bg-secondary/10 text-secondary text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{m}</span>
                    )) : <span className="text-[8px] font-bold text-gray-400">Nenhum membro</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Bloco de Endereço - Oculto para Kids */}
            {cell.type !== 'Kids' && (
              <div className="col-span-1 sm:col-span-2 p-6 bg-gray-100/50 rounded-3xl border border-gray-200 flex items-start gap-5 group">
                <div className="p-4 bg-primary text-white rounded-2xl shadow-lg group-hover:bg-secondary group-hover:text-primary transition-colors"><MapPin size={24} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Localização da Célula</p>
                  <p className="font-bold text-primary text-sm md:text-lg leading-snug break-words">{cell.address}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-1 rounded uppercase tracking-tighter">
                      {cell.day}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {cell.time}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bloco de Horário Simplificado para Kids */}
            {cell.type === 'Kids' && (
              <div className="col-span-1 sm:col-span-2 p-6 bg-gray-100/50 rounded-3xl border border-gray-200 flex items-center gap-5 group">
                <div className="p-4 bg-primary text-white rounded-2xl shadow-lg group-hover:bg-secondary group-hover:text-primary transition-colors"><Clock size={24} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dia e Hora do Encontro</p>
                  <p className="font-bold text-primary text-sm md:text-lg leading-snug">{cell.day} às {cell.time}</p>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé de Ação */}
          <div className="pt-4">
            <button
              onClick={onConfirm}
              className="w-full bg-secondary hover:bg-primary hover:text-white text-primary py-6 rounded-[2rem] font-black text-lg md:text-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-secondary/10 active:scale-[0.98] group"
            >
              <CheckCircle size={28} className="group-hover:scale-110 transition-transform" />
              Confirmar e Entrar
            </button>
            <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
              <div className="h-px w-8 bg-gray-400"></div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
                Viver em Cristo
              </p>
              <div className="h-px w-8 bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellConfirmation;
