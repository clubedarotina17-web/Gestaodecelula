
import React, { useState, useMemo } from 'react';
import { Menu, X, LogOut, ChevronRight, FileText, Share2, Users, PieChart, Droplets, MapPin, Bell, MessageCircle, Trash2, Megaphone, Target, Cloud, CloudOff } from 'lucide-react';
import { UserRole, AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cellName?: string;
  cellId?: string;
  leaderPhoto?: string;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, activeTab, setActiveTab, cellName, cellId, leaderPhoto, notifications, onMarkAsRead, onDeleteNotification }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const leaderTabs = [
    { id: 'cadastrar', label: 'Cadastrar Relatório', icon: <FileText size={20} /> },
    { id: 'relatorios', label: 'Relatórios Cadastrados', icon: <ChevronRight size={20} /> },
    { id: 'compartilhamentos', label: 'Compartilhamentos', icon: <Share2 size={20} /> },
  ];

  const adminTabs = [
    { id: 'admin-relatorios', label: 'Relatórios Cadastrados', icon: <FileText size={20} /> },
    { id: 'admin-compartilhamentos', label: 'Compartilhamentos', icon: <Share2 size={20} /> },
    { id: 'admin-batismo', label: 'Batismo', icon: <Droplets size={20} /> },
    { id: 'admin-celulas', label: 'Nossas Células', icon: <MapPin size={20} /> },
    { id: 'admin-metricas', label: 'Métricas', icon: <PieChart size={20} /> },
    { id: 'admin-metas', label: 'Metas', icon: <Target size={20} /> },
    { id: 'admin-avisos', label: 'Avisos', icon: <Megaphone size={20} /> },
  ];

  const tabs = role === 'admin' ? adminTabs : leaderTabs;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (role === 'admin') return true;
      return !n.cellId || n.cellId === cellId;
    });
  }, [notifications, role, cellId]);

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

  const handleWhatsAppFromNotif = (notification: AppNotification) => {
    if (!notification.visitorPhone) return;
    const cleanPhone = notification.visitorPhone.replace(/\D/g, '');
    let message = '';
    
    if (notification.type === 'visitor') {
      message = `Olá! Recebemos a notícia da sua visita na nossa Célula Viver em Cristo. Que alegria ter você conosco! Seja muito bem-vindo(a).`;
    } else if (notification.type === 'late') {
      message = `Olá líder! Notamos que o relatório do último encontro ainda não foi enviado no aplicativo Viver em Cristo. Poderia nos enviar assim que possível? Obrigado!`;
    }

    if (message) {
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="bg-primary text-textLight px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50 border-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none">Viver em Cristo</h1>
              </div>
              <p className="text-[10px] md:text-xs text-secondary font-bold uppercase tracking-widest mt-0.5">Gestão de células</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 hover:bg-gray-800 rounded-full transition-all relative group"
            >
              <Bell size={22} className={unreadCount > 0 ? 'text-secondary' : 'text-gray-400'} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-lg shadow-red-500/50">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest">Notificações</h4>
                  <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-primary"><X size={16} /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase">Nenhuma notificação</div>
                  ) : (
                    filteredNotifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-gray-50 flex flex-col gap-2 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-secondary/5' : ''}`}
                        onClick={() => onMarkAsRead(n.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-secondary uppercase mb-1">{n.title}</p>
                            <p className="text-sm font-medium text-gray-700 leading-snug break-words whitespace-pre-wrap">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-2 font-bold">{new Date(n.date).toLocaleTimeString()}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNotification(n.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Excluir notificação"
                            >
                              <X size={14} />
                            </button>
                            {(n.type === 'visitor' || (n.type === 'late' && role === 'admin')) && n.visitorPhone && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppFromNotif(n);
                                }}
                                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-md active:scale-95"
                                title={n.type === 'visitor' ? "Boas-vindas WhatsApp" : "Cobrar líder WhatsApp"}
                              >
                                <MessageCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-black border border-secondary/30 uppercase tracking-widest">
            {role === 'admin' ? 'Administrador' : 'Líder'}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <aside className={`
          fixed top-[64px] left-0 h-[calc(100vh-64px)] w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Navegação</h2>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-secondary text-white shadow-lg shadow-secondary/30 font-bold' 
                      : 'text-gray-600 hover:bg-gray-50 font-medium'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-white' : 'text-secondary'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-darker hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]"
            >
              <LogOut size={20} /> Sair do Sistema
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
