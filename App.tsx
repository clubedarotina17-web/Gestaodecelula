

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Layout from './components/Layout';
import LeaderDashboard from './pages/LeaderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CellConfirmation from './pages/CellConfirmation';
import { UserRole, Cell, Report, Share, Baptism, AppNotification, Goal } from './types';
import { INITIAL_CELLS } from './constants';

const App: React.FC = () => {
  // Inicialização de estados com LocalStorage para persistência imediata
  const [cells, setCells] = useState<Cell[]>(() => {
    const saved = localStorage.getItem('viver_em_cristo_cells');
    return saved ? JSON.parse(saved) : INITIAL_CELLS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('viver_em_cristo_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [shares, setShares] = useState<Share[]>(() => {
    const saved = localStorage.getItem('viver_em_cristo_shares');
    return saved ? JSON.parse(saved) : [];
  });

  const [baptisms, setBaptisms] = useState<Baptism[]>(() => {
    const saved = localStorage.getItem('viver_em_cristo_baptisms');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('viver_em_cristo_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('viver_em_cristo_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(true);
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

  // Persistir no LocalStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('viver_em_cristo_cells', JSON.stringify(cells));
    localStorage.setItem('viver_em_cristo_reports', JSON.stringify(reports));
    localStorage.setItem('viver_em_cristo_shares', JSON.stringify(shares));
    localStorage.setItem('viver_em_cristo_baptisms', JSON.stringify(baptisms));
    localStorage.setItem('viver_em_cristo_goals', JSON.stringify(goals));
    localStorage.setItem('viver_em_cristo_notifications', JSON.stringify(notifications));
  }, [cells, reports, shares, baptisms, goals, notifications]);

  const fetchData = async () => {
    try {
      const { data: cellsData } = await supabase.from('cells').select('*');
      if (cellsData && cellsData.length > 0) {
        setCells(cellsData.map(c => ({
          ...c,
          leaderPhoto: c.leader_photo,
          dismissedLateDate: c.dismissed_late_date
        })));
      }

      const { data: reportsData } = await supabase.from('reports').select('*').order('date', { ascending: false });
      if (reportsData) {
        setReports(reportsData.map(r => ({
          id: r.id, cellId: r.cell_id, cellName: r.cell_name, date: r.date,
          attendance: r.attendance, visitors: r.visitors, conversions: r.conversions,
          weeklyVisits: r.weekly_visits, firstTimeVisitorsCount: r.first_time_visitors_count,
          firstTimeVisitorsList: r.first_time_visitors_list, childrenCount: r.children_count,
          offering: r.offering, kidsOffering: r.kids_offering, summary: r.summary, isLate: r.is_late
        })));
      }

      const { data: sharesData } = await supabase.from('shares').select('*').order('created_at', { ascending: false });
      if (sharesData) setShares(sharesData);

      const { data: baptismsData } = await supabase.from('baptisms').select('*');
      if (baptismsData) setBaptisms(baptismsData);

      const { data: goalsData } = await supabase.from('goals').select('*');
      if (goalsData) {
        setGoals(goalsData.map(g => ({
          id: g.id, name: g.name, startDate: g.start_date, endDate: g.end_date,
          objective: g.objective, cellType: g.cell_type, cellId: g.cell_id, report: g.report, isCompleted: g.is_completed
        })));
      }

      const { data: notifsData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (notifsData) {
        setNotifications(notifsData.map(n => ({
          id: n.id, title: n.title, message: n.message, type: n.type, isRead: n.is_read,
          date: n.created_at, visitorPhone: n.visitor_phone, cellId: n.cell_id
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('db-changes').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogin = (role: UserRole, cell: Cell | null, rememberMe?: boolean) => {
    const newState = { role, cell, isAuthenticated: true, isConfirmed: role === 'admin' };
    setAuthState(newState);
    if (rememberMe) {
      localStorage.setItem('viver_em_cristo_auth', JSON.stringify(newState));
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
    await supabase.from('cells').insert([{
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
    await supabase.from('cells').update({
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
    await supabase.from('cells').delete().eq('id', id);
  };

  const handleDismissLateAlert = async (cellId: string, date: string) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, dismissedLateDate: date } : c));
    await supabase.from('cells').update({ dismissed_late_date: date }).eq('id', cellId);
  };

  // Funções de Relatórios
  const handleAddReport = async (newReportData: Omit<Report, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newReport = { ...newReportData, id: tempId };
    setReports(prev => [newReport, ...prev]);

    const { data } = await supabase.from('reports').insert([{
      cell_id: newReportData.cellId, cell_name: newReportData.cellName, date: newReportData.date,
      attendance: newReportData.attendance, visitors: newReportData.visitors, conversions: newReportData.conversions,
      weekly_visits: newReportData.weeklyVisits, first_time_visitors_count: newReportData.firstTimeVisitorsCount,
      first_time_visitors_list: newReportData.firstTimeVisitorsList, children_count: newReportData.childrenCount,
      offering: newReportData.offering, kids_offering: newReportData.kidsOffering, summary: newReportData.summary,
      is_late: newReportData.isLate
    }]).select();

    if (newReportData.firstTimeVisitorsCount > 0 && newReportData.firstTimeVisitorsList) {
      newReportData.firstTimeVisitorsList.forEach(v => {
        addNotification('Novo Visitante!', `${v.name} visitou a célula ${newReportData.cellName}.`, 'visitor', v.phone, newReportData.cellId);
      });
    }
  };

  const handleDeleteReport = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    await supabase.from('reports').delete().eq('id', id);
  };

  const handleUpdateReport = async (updatedReport: Report) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    await supabase.from('reports').update({
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

    await supabase.from('goals').insert([{
      name: newGoalData.name, start_date: newGoalData.startDate, end_date: newGoalData.endDate,
      objective: newGoalData.objective, cell_type: newGoalData.cellType, cell_id: newGoalData.cellId,
      report: newGoalData.report, is_completed: newGoalData.isCompleted
    }]);
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    await supabase.from('goals').update({
      name: updatedGoal.name, start_date: updatedGoal.startDate, end_date: updatedGoal.endDate,
      objective: updatedGoal.objective, cell_type: updatedGoal.cellType, cell_id: updatedGoal.cellId,
      report: updatedGoal.report, is_completed: updatedGoal.isCompleted
    }).eq('id', updatedGoal.id);
  };

  const handleDeleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await supabase.from('goals').delete().eq('id', id);
  };

  // Outras Funções
  const addNotification = async (title: string, message: string, type: string, visitorPhone?: string, cellId?: string) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newNotif: AppNotification = { id: tempId, title, message, date: new Date().toISOString(), isRead: false, type: type as any, visitorPhone, cellId };
    setNotifications(prev => [newNotif, ...prev]);
    await supabase.from('notifications').insert([{ title, message, type, visitor_phone: visitorPhone, cell_id: cellId, is_read: false }]);
  };

  const markNotifRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  };

  const handleAddShare = async (newShareData: Omit<Share, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newShare = { ...newShareData, id: tempId };
    setShares(prev => [newShare, ...prev]);
    await supabase.from('shares').insert([newShareData]);
  };

  const handleDeleteShare = async (id: string) => {
    setShares(prev => prev.filter(s => s.id !== id));
    await supabase.from('shares').delete().eq('id', id);
  };

  const handleAddBaptism = async (newBaptismData: Omit<Baptism, 'id'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newBaptism = { ...newBaptismData, id: tempId };
    setBaptisms(prev => [...prev, newBaptism]);
    await supabase.from('baptisms').insert([newBaptismData]);
  };

  if (loading && !authState.isAuthenticated) {
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
        <AdminDashboard cells={cells} reports={reports} shares={shares} baptisms={baptisms} goals={goals} activeTab={activeTab} onAddShare={handleAddShare} onDeleteShare={handleDeleteShare} onAddBaptism={handleAddBaptism} onDeleteReport={handleDeleteReport} onUpdateCell={handleUpdateCell} onAddCell={handleAddCell} onDeleteCell={handleDeleteCell} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} onNotify={addNotification} onDismissLateAlert={handleDismissLateAlert} />
      ) : (
        <LeaderDashboard cell={authState.cell!} reports={reports} shares={shares} activeTab={activeTab} setActiveTab={setActiveTab} onAddReport={handleAddReport} onUpdateReport={handleUpdateReport} onDeleteReport={handleDeleteReport} onNotify={addNotification} />
      )}
    </Layout>
  );
};

export default App;
