

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Layout from './components/Layout';
import LeaderDashboard from './pages/LeaderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CellConfirmation from './pages/CellConfirmation';
import { DebugOverlay } from './components/DebugOverlay';
import { UserRole, Cell, Report, Share, Baptism, AppNotification, Goal, AppEvent } from './types';
import { INITIAL_CELLS } from './constants';


const App: React.FC = () => {
  // Estados inicializados vazios - dados vêm do Supabase via fetchData()
  // Removido localStorage para evitar QuotaExceededError no iOS Safari
  const [cells, setCells] = useState<Cell[]>(INITIAL_CELLS);
  const [reports, setReports] = useState<Report[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [baptisms, setBaptisms] = useState<Baptism[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [loading, setLoading] = useState(true);

  // Apenas autenticação fica no localStorage (pequeno, ~1KB)
  const [authState, setAuthState] = useState<{
    role: UserRole;
    cell: Cell | null;
    isAuthenticated: boolean;
    isConfirmed: boolean;
  }>(() => {
    const savedAuth = localStorage.getItem('viver_em_cristo_auth');
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch (e) {
        console.error('Erro ao restaurar sessão:', e);
      }
    }
    return {
      role: null,
      cell: null,
      isAuthenticated: false,
      isConfirmed: false,
    };
  });

  const [activeTab, setActiveTab] = useState(() => {
    const savedAuth = localStorage.getItem('viver_em_cristo_auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        return auth.role === 'admin' ? 'admin-relatorios' : 'cadastrar';
      } catch (e) { }
    }
    return 'cadastrar';
  });


  // REMOVIDO: Persistência no localStorage (causava QuotaExceededError no iOS)
  // Dados agora vêm APENAS do Supabase - fonte única de verdade
  // localStorage usado APENAS para autenticação (< 1KB)

  const fetchData = async () => {
    // Debug para iOS
    console.log('=== INIT FETCH DATA ===');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'PRESENTE' : 'AUSENTE');
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRESENTE' : 'AUSENTE');
    console.log('Supabase Client:', supabase ? 'INICIALIZADO' : 'NULL');
    console.log('User Agent:', navigator.userAgent);

    // Timeout de segurança para iOS/Safari
    const timeoutId = setTimeout(() => {
      console.warn('Timeout na sincronização - continuando com dados locais');
      setLoading(false);
    }, 10000); // 10 segundos

    try {
      // Verificar se Supabase está disponível
      if (!supabase) {
        console.warn('⚠️ Supabase não disponível - usando apenas dados locais');
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      console.log('Iniciando sincronização com Supabase...');

      const { data: cellsData, error: cellsError } = await supabase.from('cells').select('*');
      if (cellsError) console.error('Erro ao buscar células:', cellsError);
      if (cellsData && cellsData.length > 0) {
        setCells(cellsData.map(c => ({
          ...c,
          leaderPhoto: c.leader_photo,
          dismissedLateDate: c.dismissed_late_date
        })));
      }

      const { data: reportsData, error: reportsError } = await supabase.from('reports').select('*').order('date', { ascending: false });
      if (reportsError) console.error('Erro ao buscar relatórios:', reportsError);
      if (reportsData) {
        setReports(reportsData.map(r => ({
          id: r.id, cellId: r.cell_id, cellName: r.cell_name, date: r.date,
          attendance: Number(r.attendance),
          visitors: Number(r.visitors),
          conversions: Number(r.conversions),
          weeklyVisits: Number(r.weekly_visits),
          firstTimeVisitorsCount: Number(r.first_time_visitors_count),
          firstTimeVisitorsList: r.first_time_visitors_list,
          childrenCount: Number(r.children_count),
          offering: Number(r.offering),
          kidsOffering: Number(r.kids_offering),
          summary: r.summary,
          isLate: r.is_late
        })));
      }

      const { data: sharesData, error: sharesError } = await supabase.from('shares').select('*').order('created_at', { ascending: false });
      if (sharesError) console.error('Erro ao buscar compartilhamentos:', sharesError);
      if (sharesData) setShares(sharesData);

      const { data: baptismsData, error: baptismsError } = await supabase.from('baptisms').select('*');
      if (baptismsError) console.error('Erro ao buscar batismos:', baptismsError);
      if (baptismsData) setBaptisms(baptismsData);

      const { data: goalsData, error: goalsError } = await supabase.from('goals').select('*');
      if (goalsError) console.error('Erro ao buscar metas:', goalsError);
      if (goalsData) {
        setGoals(goalsData.map(g => ({
          id: g.id, name: g.name, startDate: g.start_date, endDate: g.end_date,
          objective: g.objective, cellType: g.cell_type, cellId: g.cell_id, report: g.report, isCompleted: g.is_completed
        })));
      }

      const { data: notifsData, error: notifsError } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (notifsError) console.error('Erro ao buscar notificações:', notifsError);
      if (notifsData) {
        setNotifications(notifsData.map(n => ({
          id: n.id, title: n.title, message: n.message, type: n.type, isRead: n.is_read,
          date: n.created_at, visitorPhone: n.visitor_phone, cellId: n.cell_id
        })));
      }

      const { data: eventsData, error: eventsError } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (eventsError) console.error('Erro ao buscar eventos:', eventsError);
      if (eventsData) {
        setEvents(eventsData.map(e => ({
          id: e.id, title: e.title, description: e.description, date: e.date,
          location: e.location, cellType: e.cell_type
        })));
      }

      console.log('Sincronização concluída com sucesso.');
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Erro crítico na sincronização:', error);
      clearTimeout(timeoutId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Só criar canal se Supabase estiver disponível
    if (supabase) {
      const channel = supabase.channel('db-changes').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData()).subscribe();
      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const handleLogin = (role: UserRole, cell: Cell | null, rememberMe?: boolean) => {
    const newState = { role, cell, isAuthenticated: true, isConfirmed: role === 'admin' };
    setAuthState(newState);
    if (rememberMe) {
      try {
        localStorage.setItem('viver_em_cristo_auth', JSON.stringify(newState));
      } catch (e) {
        // QuotaExceededError - continua funcionando sem salvar sessão
        console.warn('Não foi possível salvar sessão no localStorage:', e);
      }
    }
    setActiveTab(role === 'admin' ? 'admin-relatorios' : 'cadastrar');
  };

  const handleLogout = () => {
    setAuthState({ role: null, cell: null, isAuthenticated: false, isConfirmed: false });
    localStorage.removeItem('viver_em_cristo_auth');
    setActiveTab('cadastrar');
  };

  // Funções de manipulação de Células
  const handleAddCell = async (newCellData: Omit<Cell, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newCell = { ...newCellData, id: tempId };

    // Atualização Local Imediata
    setCells(prev => [...prev, newCell]);

    // Persistência no Banco
    await supabase?.from('cells').insert([{
      id: tempId,
      name: newCellData.name,
      leader: newCellData.leader,
      host: newCellData.host,
      trainee: newCellData.trainee,
      secretary: newCellData.secretary,
      team: newCellData.team,
      address: newCellData.address,
      type: newCellData.type,
      day: newCellData.day,
      time: newCellData.time,
      region: newCellData.region,
      phone: newCellData.phone,
      leader_photo: newCellData.leaderPhoto
    }]);
  };

  const handleUpdateCell = async (updatedCell: Cell) => {
    setCells(prev => prev.map(c => c.id === updatedCell.id ? updatedCell : c));
    await supabase?.from('cells').update({
      name: updatedCell.name, leader: updatedCell.leader, host: updatedCell.host,
      trainee: updatedCell.trainee, secretary: updatedCell.secretary, team: updatedCell.team,
      address: updatedCell.address, type: updatedCell.type, day: updatedCell.day,
      time: updatedCell.time, region: updatedCell.region, phone: updatedCell.phone,
      leader_photo: updatedCell.leaderPhoto
    }).eq('id', updatedCell.id);
    if (authState.cell?.id === updatedCell.id) setAuthState(prev => ({ ...prev, cell: updatedCell }));
  };

  const handleDeleteCell = async (id: string) => {
    setCells(prev => prev.filter(c => c.id !== id));
    await supabase?.from('cells').delete().eq('id', id);
  };

  const handleDismissLateAlert = async (cellId: string, date: string) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, dismissedLateDate: date } : c));
    await supabase?.from('cells').update({ dismissed_late_date: date }).eq('id', cellId);
  };

  // Funções de Relatórios
  const handleAddReport = async (newReportData: Omit<Report, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newReport = { ...newReportData, id: tempId };
    setReports(prev => [newReport, ...prev]);

    const result = await supabase?.from('reports').insert([{
      id: tempId,
      cell_id: newReportData.cellId, cell_name: newReportData.cellName, date: newReportData.date,
      attendance: newReportData.attendance, visitors: newReportData.visitors, conversions: newReportData.conversions,
      weekly_visits: newReportData.weeklyVisits,
      first_time_visitors_count: newReportData.firstTimeVisitorsCount,
      first_time_visitors_list: newReportData.firstTimeVisitorsList,
      children_count: newReportData.childrenCount,
      offering: newReportData.offering, kids_offering: newReportData.kidsOffering, summary: newReportData.summary,
      is_late: newReportData.isLate
    }]);

    if (result?.error) {
      console.error('Erro ao adicionar relatório:', result.error);
      alert('Erro ao salvar no banco de dados. Verifique sua conexão.');
    }

    if (newReportData.firstTimeVisitorsCount > 0 && newReportData.firstTimeVisitorsList) {
      newReportData.firstTimeVisitorsList.forEach(v => {
        addNotification('Novo Visitante!', `${v.name} visitou a célula ${newReportData.cellName}.`, 'visitor', v.phone, newReportData.cellId);
      });
    }
  };

  const handleDeleteReport = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    await supabase?.from('reports').delete().eq('id', id);
  };

  const handleUpdateReport = async (updatedReport: Report) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    await supabase?.from('reports').update({
      date: updatedReport.date, attendance: updatedReport.attendance, visitors: updatedReport.visitors,
      conversions: updatedReport.conversions, weekly_visits: updatedReport.weeklyVisits,
      first_time_visitors_count: updatedReport.firstTimeVisitorsCount,
      first_time_visitors_list: updatedReport.firstTimeVisitorsList,
      children_count: updatedReport.childrenCount, offering: updatedReport.offering,
      kids_offering: updatedReport.kidsOffering, summary: updatedReport.summary,
      is_late: updatedReport.isLate
    }).eq('id', updatedReport.id);
  };

  // Funções de Metas
  const handleAddGoal = async (newGoalData: Omit<Goal, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newGoal = { ...newGoalData, id: tempId };
    setGoals(prev => [...prev, newGoal]);

    const result = await supabase?.from('goals').insert([{
      id: tempId,
      name: newGoalData.name, start_date: newGoalData.startDate, end_date: newGoalData.endDate,
      objective: newGoalData.objective, cell_type: newGoalData.cellType, cell_id: newGoalData.cellId,
      report: newGoalData.report, is_completed: newGoalData.isCompleted
    }]);

    if (result?.error) {
      console.error('Erro ao salvar meta:', result.error);
      alert('Erro ao salvar meta no banco.');
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    await supabase?.from('goals').update({
      name: updatedGoal.name, start_date: updatedGoal.startDate, end_date: updatedGoal.endDate,
      objective: updatedGoal.objective, cell_type: updatedGoal.cellType, cell_id: updatedGoal.cellId,
      report: updatedGoal.report, is_completed: updatedGoal.isCompleted
    }).eq('id', updatedGoal.id);
  };

  const handleDeleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await supabase?.from('goals').delete().eq('id', id);
  };

  // Outras Funções
  const addNotification = async (title: string, message: string, type: string, visitorPhone?: string, cellId?: string) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newNotif: AppNotification = { id: tempId, title, message, date: new Date().toISOString(), isRead: false, type: type as any, visitorPhone, cellId };
    setNotifications(prev => [newNotif, ...prev]);
    await supabase?.from('notifications').insert([{ title, message, type, visitor_phone: visitorPhone, cell_id: cellId, is_read: false }]);
  };

  const markNotifRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await supabase?.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase?.from('notifications').delete().eq('id', id);
  };

  const handleAddShare = async (newShareData: Omit<Share, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newShare = { ...newShareData, id: tempId };
    setShares(prev => [newShare, ...prev]);
    await supabase?.from('shares').insert([{
      id: tempId,
      title: newShareData.title,
      description: newShareData.description,
      date: newShareData.date,
      file_url: newShareData.fileUrl
    }]);
  };

  const handleDeleteShare = async (id: string) => {
    setShares(prev => prev.filter(s => s.id !== id));
    await supabase?.from('shares').delete().eq('id', id);
  };

  const handleAddBaptism = async (newBaptismData: Omit<Baptism, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newBaptism = { ...newBaptismData, id: tempId };
    setBaptisms(prev => [...prev, newBaptism]);
    await supabase?.from('baptisms').insert([{
      id: tempId,
      name: newBaptismData.name,
      whatsapp: newBaptismData.whatsapp,
      date: newBaptismData.date,
      cell_name: newBaptismData.cellName
    }]);
  };

  const handleAddEvent = async (newEventData: Omit<AppEvent, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newEvent = { ...newEventData, id: tempId };
    setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    await supabase?.from('events').insert([{
      title: newEventData.title,
      description: newEventData.description,
      date: newEventData.date,
      location: newEventData.location,
      cell_type: newEventData.cellType
    }]);
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    await supabase?.from('events').delete().eq('id', id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 mb-6 animate-pulse">
          <img src="https://lh3.googleusercontent.com/d/1zTjbN1NbTxTgtGtzhQ2ngvIyBHHxciDY" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <p className="text-secondary font-black uppercase tracking-widest text-xs">Sincronizando Sistema...</p>
      </div>
    );
  }

  if (!authState.isAuthenticated) return <Login onLogin={handleLogin} cells={cells} />;
  if (authState.role === 'leader' && authState.cell && !authState.isConfirmed) {
    return <CellConfirmation cell={authState.cell} onConfirm={() => setAuthState(prev => ({ ...prev, isConfirmed: true }))} onBack={handleLogout} />;
  }

  return (
    <Layout role={authState.role} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} cellName={authState.cell?.name} cellId={authState.cell?.id} leaderPhoto={authState.cell?.leaderPhoto} notifications={notifications} onMarkAsRead={markNotifRead} onDeleteNotification={deleteNotification}>
      {authState.role === 'admin' ? (
        <AdminDashboard cells={cells} reports={reports} shares={shares} baptisms={baptisms} goals={goals} events={events} activeTab={activeTab} onAddShare={handleAddShare} onDeleteShare={handleDeleteShare} onAddBaptism={handleAddBaptism} onDeleteReport={handleDeleteReport} onUpdateCell={handleUpdateCell} onAddCell={handleAddCell} onDeleteCell={handleDeleteCell} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} onNotify={addNotification} onDismissLateAlert={handleDismissLateAlert} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} />
      ) : (
        <LeaderDashboard cell={authState.cell!} reports={reports} shares={shares} events={events} activeTab={activeTab} setActiveTab={setActiveTab} onAddReport={handleAddReport} onUpdateReport={handleUpdateReport} onDeleteReport={handleDeleteReport} onNotify={addNotification} />
      )}
      {/* Debug overlay para iOS - mostra logs na tela */}
      <DebugOverlay />
    </Layout>
  );
};

export default App;
