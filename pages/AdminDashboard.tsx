
import React, { useState, useMemo, useRef } from 'react';
import {
  FileText, Share2, MapPin, MessageCircle,
  Upload, Search, Filter, Calendar,
  Phone, Star, Plus, Heart, DollarSign,
  Users, Baby, Sparkles, CheckCircle2, AlertCircle, X, Pencil, Save, Footprints, TrendingUp, Layers,
  Home, ChevronDown, Droplets, Trash2, LineChart as LucideLineChart, Landmark, Download, GraduationCap, PenTool, UserPlus,
  ArrowUpRight, ArrowDownRight, MessageSquareText, Coins, Megaphone, Camera, User, Clock, Briefcase, BellRing, Activity, Target, Flag, CheckCircle
} from 'lucide-react';
import { Cell as CellTypeData, Report, Share, Baptism, CellType, Visitor, Goal, AppEvent } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell as ReCell, Legend, LineChart, Line, ComposedChart, Area
} from 'recharts';

interface AdminDashboardProps {
  cells: CellTypeData[];
  reports: Report[];
  shares: Share[];
  baptisms: Baptism[];
  goals: Goal[];
  activeTab: string;
  onAddShare: (share: Omit<Share, 'id'>) => void;
  onDeleteShare: (id: string) => void;
  onAddBaptism: (baptism: Omit<Baptism, 'id'>) => void;
  onDeleteReport: (id: string) => void;
  onUpdateCell: (cell: CellTypeData) => void;
  onAddCell: (cell: Omit<CellTypeData, 'id'>) => void;
  onDeleteCell: (id: string) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onNotify: (title: string, message: string, type: 'visitor' | 'late' | 'event' | 'info' | 'notice', phone?: string, cellId?: string) => void;
  onDismissLateAlert: (cellId: string, date: string) => void;
  events: AppEvent[];
  onAddEvent: (event: Omit<AppEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

const WEEK_DAYS = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cells = [], reports = [], shares = [], baptisms = [], goals = [], events = [], activeTab, onAddShare, onDeleteShare, onAddBaptism, onDeleteReport, onUpdateCell, onAddCell, onDeleteCell, onAddGoal, onUpdateGoal, onDeleteGoal, onNotify, onDismissLateAlert, onAddEvent, onDeleteEvent
}) => {
  const [filterCell, setFilterCell] = useState('Todas');
  const [filterType, setFilterType] = useState<CellType | 'Todas'>('Todas');
  const [goalFilterStatus, setGoalFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const [reportFilterDate, setReportFilterDate] = useState<string>('');
  const [reportFilterPeriod, setReportFilterPeriod] = useState<string>('all');
  const [reportFilterYear, setReportFilterYear] = useState<string>(new Date().getFullYear().toString());

  const [noticeForm, setNoticeForm] = useState({ recipientId: 'all', title: '', message: '' });
  const [baptismForm, setBaptismForm] = useState({ name: '', whatsapp: '', date: '', cellName: '' });
  const [shareForm, setShareForm] = useState({ title: '', description: '', fileUrl: '' });
  const [eventForm, setEventForm] = useState<Omit<AppEvent, 'id'>>({ title: '', description: '', date: '', location: '', cellType: 'Todas' });

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalFormData, setGoalFormData] = useState<Omit<Goal, 'id'>>({
    name: '',
    startDate: '',
    endDate: '',
    objective: '',
    cellType: 'Todas',
    cellId: '',
    report: '',
    isCompleted: false
  });

  const [showCellForm, setShowCellForm] = useState(false);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [cellFormData, setCellFormData] = useState<Omit<CellTypeData, 'id'>>({
    name: '', leader: '', host: '', trainee: '', secretary: '', team: [],
    address: '', type: 'Adulto', day: 'Quinta-Feira', time: '20:00',
    region: 'Dom Bosco', phone: '', leaderPhoto: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareFileInputRef = useRef<HTMLInputElement>(null);

  const years = Array.from({ length: 2031 - 2024 + 1 }, (_, i) => (2024 + i).toString());

  const getDayOfWeek = (dateString: string) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const d = new Date(dateString + 'T12:00:00');
    return days[d.getDay()];
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkPeriodMatch = (reportDate: Date, period: string, targetYear: string) => {
    const now = new Date();
    const reportYear = reportDate.getFullYear().toString();
    const reportMonth = reportDate.getMonth(); // 0-11

    if (targetYear !== 'all' && reportYear !== targetYear) return false;
    if (period === 'all') return true;

    switch (period) {
      case 'week': {
        const diffTime = Math.abs(now.getTime() - reportDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      case 'month': return reportMonth === now.getMonth() && reportYear === now.getFullYear().toString();
      case 'bimester': {
        const currentBimester = Math.floor(now.getMonth() / 2);
        const reportBimester = Math.floor(reportMonth / 2);
        return currentBimester === reportBimester && reportYear === now.getFullYear().toString();
      }
      case 'quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const reportQuarter = Math.floor(reportMonth / 3);
        return currentQuarter === reportQuarter && reportYear === now.getFullYear().toString();
      }
      case 'semester': {
        const currentSemester = now.getMonth() < 6 ? 0 : 1;
        const reportSemester = reportMonth < 6 ? 0 : 1;
        return currentSemester === reportSemester && reportYear === now.getFullYear().toString();
      }
      case 'year': return reportYear === targetYear;
      default: return true;
    }
  };

  const filteredReportsForList = useMemo(() => {
    return (reports || []).filter(r => {
      const cell = cells.find(c => c.id === r.cellId);
      const matchType = filterType === 'Todas' || (cell && cell.type === filterType);
      const matchCellName = filterCell === 'Todas' || r.cellName === filterCell;

      if (!matchType || !matchCellName) return false;
      if (reportFilterDate) return r.date === reportFilterDate;

      const reportDate = new Date(r.date + 'T12:00:00');
      return checkPeriodMatch(reportDate, reportFilterPeriod, reportFilterYear);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, reportFilterPeriod, reportFilterYear, reportFilterDate, filterType, filterCell, cells]);

  const lateReportsList = useMemo(() => {
    const today = new Date();
    const dayMap: { [key: string]: number } = {
      'Domingo': 0, 'Segunda-Feira': 1, 'Terça-Feira': 2, 'Quarta-Feira': 3,
      'Quinta-Feira': 4, 'Sexta-Feira': 5, 'Sábado': 6
    };

    const results: { cell: CellTypeData, dateStr: string }[] = [];

    (cells || []).forEach(cell => {
      const cellDayName = cell.day.split(' ')[0].trim();
      const meetingDayIndex = dayMap[cellDayName];
      if (meetingDayIndex === undefined) return;

      const lastMeetingDate = new Date(today);
      let diff = today.getDay() - meetingDayIndex;
      if (diff < 0) diff += 7;
      lastMeetingDate.setDate(today.getDate() - diff);

      const [hours, minutes] = (cell.time || '20:00').split(':').map(Number);
      lastMeetingDate.setHours(hours, minutes, 0, 0);

      const timeSinceMeeting = today.getTime() - lastMeetingDate.getTime();
      const isOver24h = timeSinceMeeting >= (24 * 60 * 60 * 1000);

      if (isOver24h) {
        const dateStr = getLocalDateString(lastMeetingDate);
        if (cell.dismissedLateDate === dateStr) return;
        const hasReport = (reports || []).some(r => r.cellId === cell.id && r.date === dateStr);
        if (!hasReport) results.push({ cell, dateStr });
      }
    });

    return results;
  }, [cells, reports]);

  const handleChargeLeader = (cell: CellTypeData, dateStr?: string) => {
    const cleanPhone = cell.phone.replace(/\D/g, '');
    const dateFormatted = dateStr ? new Date(dateStr + 'T12:00:00').toLocaleDateString() : '';
    const message = `Olá líder! Percebemos que sua célula de ${cell.day} ${dateFormatted ? `(dia ${dateFormatted})` : ''} ainda não possui relatório cadastrado. Tudo bem por aí?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDismissLateAlertInternal = (cellId: string, dateStr: string) => {
    onDismissLateAlert(cellId, dateStr);
  };

  const metricsData = useMemo(() => {
    const filteredReports = (reports || []).filter(r => {
      const cell = cells.find(c => c.id === r.cellId);
      if (!cell) return false;
      const matchType = filterType === 'Todas' || cell.type === filterType;
      const matchCell = filterCell === 'Todas' || r.cellName === filterCell;
      const reportDate = new Date(r.date + 'T12:00:00');
      const matchPeriod = checkPeriodMatch(reportDate, reportFilterPeriod, reportFilterYear);
      return matchType && matchCell && matchPeriod;
    });

    const totals = filteredReports.reduce((acc, r) => ({
      adults: acc.adults + r.attendance,
      visitors: acc.visitors + r.visitors,
      firstTime: acc.firstTime + (r.firstTimeVisitorsCount || 0),
      conversions: acc.conversions + (r.conversions || 0),
      visits: acc.visits + (r.weeklyVisits || 0),
      children: acc.children + (r.childrenCount || 0),
      offeringAdult: acc.offeringAdult + r.offering,
      offeringKids: acc.offeringKids + (r.kidsOffering || 0)
    }), { adults: 0, visitors: 0, firstTime: 0, conversions: 0, visits: 0, children: 0, offeringAdult: 0, offeringKids: 0 });

    let baptizedCount = 0;
    let notBaptizedCount = 0;
    let encounterYesCount = 0;
    let encounterNoCount = 0;

    filteredReports.forEach(r => {
      if (r.firstTimeVisitorsList) {
        r.firstTimeVisitorsList.forEach(v => {
          if (v.isBaptized) baptizedCount++; else notBaptizedCount++;
          if (v.hasAttendedEncounter) encounterYesCount++; else encounterNoCount++;
        });
      }
    });

    const totalPeople = totals.adults + totals.visitors;
    const comparisonData = [{ name: 'Presença', 'Total Presentes': totals.adults, Visitantes: totals.visitors, '1ª Vez': totals.firstTime }];
    const recurrentVisitors = Math.max(0, totals.visitors - totals.firstTime);
    const visitorProfileData = [{ name: 'Visitantes 1ª Vez', value: totals.firstTime }, { name: 'Recorrentes', value: recurrentVisitors }];
    const baptizedPieData = [{ name: 'Batizados', value: baptizedCount }, { name: 'Não Batizados', value: notBaptizedCount }];
    const encounterPieData = [{ name: 'Foi ao Encontro', value: encounterYesCount }, { name: 'Não Foi', value: encounterNoCount }];

    const cellReports: Record<string, Report[]> = {};
    filteredReports.forEach(r => {
      if (!cellReports[r.cellName]) cellReports[r.cellName] = [];
      cellReports[r.cellName].push(r);
    });

    const attentionLevels = Object.keys(cellReports).map(name => {
      const reportsList = cellReports[name].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let weeksWithoutVisitors = 0;
      for (const report of reportsList) {
        if (report.visitors === 0) weeksWithoutVisitors++; else break;
      }
      const avgVisitors = reportsList.reduce((a, b) => a + b.visitors, 0) / reportsList.length;
      const avgAttendance = reportsList.reduce((a, b) => a + b.attendance, 0) / reportsList.length;

      let level: 'Normal' | 'Atenção' | 'Crítico' = 'Normal';
      let label = 'Tudo OK';
      let reason = 'Célula com visitantes regulares. Tudo OK.';
      let color = 'text-green-500';
      let bgColor = 'bg-green-50';

      if (weeksWithoutVisitors >= 2) {
        level = 'Atenção';
        label = 'Precisa de atenção';
        reason = `Célula há ${weeksWithoutVisitors} relatórios consecutivos sem visitantes. Requer atenção.`;
        color = 'text-amber-500';
        bgColor = 'bg-amber-50';
      } else if (avgVisitors <= 0) {
        level = 'Crítico';
        label = 'Acompanhar';
        reason = `Célula sem média de visitantes no período selecionado. Precisa de acompanhamento.`;
        color = 'text-red-500';
        bgColor = 'bg-red-50';
      }
      return { name, level, label, reason, color, bgColor, avgVisitors, avgAttendance };
    }).sort((a, b) => {
      const order = { 'Crítico': 0, 'Atenção': 1, 'Normal': 2 };
      return order[a.level] - order[b.level];
    });

    return { totals, comparisonData, visitorProfileData, baptizedPieData, encounterPieData, attentionLevels, totalPeople };
  }, [reports, cells, filterCell, filterType, reportFilterPeriod, reportFilterYear]);

  const COLORS = ['#00b4bc', '#000000', '#050426', '#10b981'];
  const CONSOLIDATION_COLORS = ['#6366f1', '#f59e0b'];

  const handleOpenCellForm = (cell?: CellTypeData) => {
    if (cell) {
      setEditingCellId(cell.id);
      setCellFormData({ ...cell, team: cell.team || [] });
    } else {
      setEditingCellId(null);
      setCellFormData({
        name: '', leader: '', host: '', trainee: '', secretary: '', team: [],
        address: '', type: 'Adulto', day: 'Quinta-Feira', time: '20:00',
        region: 'Dom Bosco', phone: '', leaderPhoto: ''
      });
    }
    setShowCellForm(true);
  };

  const handleCellFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTeam = cellFormData.team.filter(m => m.trim() !== '');
    const finalData = { ...cellFormData, team: cleanedTeam };
    if (editingCellId) onUpdateCell({ ...finalData, id: editingCellId });
    else onAddCell(finalData);
    setShowCellForm(false);
  };

  const handleOpenGoalForm = (goal?: Goal) => {
    if (goal) {
      setEditingGoalId(goal.id);
      setGoalFormData({ ...goal, cellId: goal.cellId || '' });
    } else {
      setEditingGoalId(null);
      setGoalFormData({ name: '', startDate: '', endDate: '', objective: '', cellType: 'Todas', cellId: '', report: '', isCompleted: false });
    }
    setShowGoalForm(true);
  };

  const handleGoalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoalId) onUpdateGoal({ ...goalFormData, id: editingGoalId });
    else onAddGoal(goalFormData);
    setShowGoalForm(false);
  };

  const toggleGoalCompletion = (goal: Goal) => onUpdateGoal({ ...goal, isCompleted: !goal.isCompleted });

  const filteredGoals = useMemo(() => {
    return (goals || []).filter(g => {
      if (goalFilterStatus === 'completed') return g.isCompleted;
      if (goalFilterStatus === 'pending') return !g.isCompleted;
      return true;
    });
  }, [goals, goalFilterStatus]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCellFormData({ ...cellFormData, leaderPhoto: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleTeamMemberChange = (index: number, value: string) => {
    const newTeam = [...cellFormData.team];
    newTeam[index] = value;
    setCellFormData({ ...cellFormData, team: newTeam });
  };

  const handleSendAppNotice = () => {
    if (!noticeForm.title || !noticeForm.message) return alert("Preencha título e mensagem.");
    if (noticeForm.recipientId === 'all') {
      cells.forEach(c => onNotify(noticeForm.title, noticeForm.message, 'notice', undefined, c.id));
      alert("Aviso enviado para todos os líderes!");
    } else {
      onNotify(noticeForm.title, noticeForm.message, 'notice', undefined, noticeForm.recipientId);
      alert("Aviso enviado para o líder selecionado!");
    }
    setNoticeForm({ ...noticeForm, title: '', message: '' });
  };

  const handleSendWhatsAppNotice = () => {
    if (noticeForm.recipientId === 'all') return alert("Selecione um líder específico para enviar via WhatsApp.");
    const cell = cells.find(c => c.id === noticeForm.recipientId);
    if (!cell || !cell.phone) return alert("Telefone não cadastrado.");
    const message = `*Aviso Importante - Viver em Cristo*\n\n*${noticeForm.title}*\n\n${noticeForm.message}`;
    window.open(`https://wa.me/55${cell.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddBaptismCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baptismForm.name || !baptismForm.date || !baptismForm.cellName) return alert("Preencha os campos obrigatórios.");
    onAddBaptism(baptismForm);
    setBaptismForm({ name: '', whatsapp: '', date: '', cellName: '' });
    alert("Candidato ao batismo cadastrado com sucesso!");
  };

  const handleAddShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareForm.title || !shareForm.description) return alert("Preencha título e descrição.");
    onAddShare({ ...shareForm, date: new Date().toISOString().split('T')[0] });
    setShareForm({ title: '', description: '', fileUrl: '' });
    alert("Material compartilhado com sucesso!");
  };

  const handleShareFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setShareForm({ ...shareForm, fileUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {activeTab === 'admin-relatorios' && (
        <div className="space-y-10 max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 px-2">
            <div>
              <h3 className="text-4xl font-black text-primary uppercase tracking-tighter leading-none">Relatórios Cadastrados</h3>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Visão geral dos encontros enviados</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100">
              <div className="flex items-center gap-2 px-3 border-r border-gray-100 h-10">
                <Layers size={16} className="text-secondary" />
                <select value={filterType} onChange={e => { setFilterType(e.target.value as any); setFilterCell('Todas'); }} className="bg-transparent text-[10px] font-black uppercase outline-none appearance-none pr-5">
                  <option value="Todas">Tipos (Todos)</option>
                  <option value="Adulto">Adulto</option>
                  <option value="Jovem">Jovem</option>
                  <option value="Juvenil">Juvenil</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 border-r border-gray-100 h-10">
                <MapPin size={16} className="text-secondary" />
                <select value={filterCell} onChange={e => setFilterCell(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none appearance-none pr-5">
                  <option value="Todas">Células (Todas)</option>
                  {cells.filter(c => filterType === 'Todas' || c.type === filterType).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 px-4 h-10">
                <Calendar size={18} className="text-secondary" />
                <input type="date" value={reportFilterDate} onChange={(e) => setReportFilterDate(e.target.value)} className="bg-transparent text-[11px] font-black uppercase tracking-wider outline-none cursor-pointer" />
              </div>
            </div>
          </div>
          {lateReportsList.length > 0 && (
            <div className="space-y-4 px-2 animate-in slide-in-from-left duration-500">
              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2 ml-1"><AlertCircle size={14} /> Pendências Identificadas (Atrasos &gt; 24h)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lateReportsList.map(item => (
                  <div key={`late-${item.cell.id}`} className="bg-white border-2 border-amber-100 p-4 md:p-5 rounded-[2rem] flex flex-row items-center justify-between shadow-xl shadow-amber-500/5 group">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-2">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Clock className="w-5 h-5 md:w-6 md:h-6" /></div>
                      <div className="min-w-0">
                        <p className="font-black text-primary text-[10px] md:text-xs uppercase leading-tight">Relatório pendente (Atrasado) de {new Date(item.dateStr + 'T12:00:00').toLocaleDateString()} - Célula: {item.cell.name} - {item.cell.day} e {item.cell.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                      <button onClick={() => handleChargeLeader(item.cell, item.dateStr)} className="p-2.5 md:p-3 bg-green-500 text-white rounded-xl md:rounded-2xl hover:bg-green-600 transition-all shadow-md shadow-green-500/20 active:scale-95"><MessageCircle className="w-4 h-4 md:w-[18px] md:h-[18px]" /></button>
                      <button onClick={() => handleDismissLateAlertInternal(item.cell.id, item.dateStr)} className="p-2.5 md:p-3 bg-gray-100 text-gray-400 rounded-xl md:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"><X className="w-4 h-4 md:w-[18px] md:h-[18px]" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-6">
            {filteredReportsForList.length === 0 ? (
              <div className="bg-white p-24 rounded-[3.5rem] text-center border-2 border-dashed border-gray-200">
                <Search size={64} className="mx-auto mb-4 opacity-5 text-secondary" /><p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Nenhum relatório encontrado</p>
              </div>
            ) : (
              filteredReportsForList.map(report => (
                <div key={report.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden group hover:shadow-xl transition-all">
                  <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-white w-12 h-12 rounded-[1.25rem] flex flex-col items-center justify-center shadow-lg">
                        <span className="text-[8px] font-black uppercase leading-none opacity-60">{new Date(report.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}</span>
                        <span className="text-xl font-black leading-none">{new Date(report.date + 'T12:00:00').getDate()}</span>
                      </div>
                      <div><p className="font-black text-primary text-xs uppercase leading-tight tracking-wider">{report.cellName}</p><p className="text-[9px] text-secondary font-black uppercase mt-0.5">{getDayOfWeek(report.date)}</p></div>
                    </div>
                    <button onClick={() => onDeleteReport(report.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                  <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600 font-bold italic border-l-4 border-secondary/20 pl-4">"{report.summary || 'Sem resumo.'}"</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[8px] font-black text-gray-400 uppercase">Total Presentes</p><p className="text-sm font-black">{report.attendance}</p></div>
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[8px] font-black text-gray-400 uppercase">Visitantes</p><p className="text-sm font-black">{report.visitors}</p></div>
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100"><p className="text-[8px] font-black text-amber-600 uppercase">1ª Vez</p><p className="text-sm font-black">{report.firstTimeVisitorsCount || 0}</p></div>
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-[8px] font-black text-blue-500 uppercase">Crianças</p><p className="text-sm font-black">{report.childrenCount || 0}</p></div>
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[8px] font-black text-gray-400 uppercase">Conversões</p><p className="text-sm font-black">{report.conversions}</p></div>
                      <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100"><p className="text-[8px] font-black text-indigo-600 uppercase">Visitas</p><p className="text-sm font-black">{report.weeklyVisits || 0}</p></div>
                      <div className="p-3 bg-green-50 rounded-2xl border border-green-100"><p className="text-[8px] font-black text-green-500 uppercase">Oferta</p><p className="text-sm font-black text-green-700">R${report.offering.toFixed(2)}</p></div>
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100"><p className="text-[8px] font-black text-blue-500 uppercase">Oferta Kids</p><p className="text-sm font-black text-blue-700">R${(report.kidsOffering || 0).toFixed(2)}</p></div>

                    </div>
                    {report.firstTimeVisitorsList && report.firstTimeVisitorsList.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1"><Sparkles size={12} /> Detalhes dos Visitantes (1ª Vez)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {report.firstTimeVisitorsList.map((v, i) => (
                            <div key={i} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-primary uppercase truncate mb-1">{v.name}</p>
                                  <a href={`https://wa.me/55${v.phone.replace(/\D/g, '')}`} target="_blank" className="text-[10px] text-green-600 font-black flex items-center gap-1 hover:underline">
                                    <MessageCircle size={10} /> {v.phone}
                                  </a>
                                </div>
                                <div className="flex flex-col gap-1 items-end shrink-0">
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase ${v.isBaptized ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {v.isBaptized ? 'Batizado' : 'Não Batizado'}
                                  </span>
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase ${v.hasAttendedEncounter ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {v.hasAttendedEncounter ? 'Foi ao Encontro' : 'Não Foi ao Encontro'}
                                  </span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-amber-100/50">
                                <p className="text-[9px] font-bold text-gray-500 flex items-start gap-1">
                                  <MapPin size={10} className="mt-0.5 shrink-0" /> {v.address || 'Endereço não informado'}
                                </p>
                              </div>
                              <a
                                href={`https://wa.me/55${v.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                className="mt-auto w-full py-2 bg-green-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20 active:scale-95"
                              >
                                <MessageCircle size={12} /> Chamar no WhatsApp
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'admin-celulas' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center px-4"><h3 className="text-3xl font-black text-primary uppercase tracking-tighter">Nossas Células</h3><button onClick={() => handleOpenCellForm()} className="bg-secondary text-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-secondary/10"><Plus size={18} /> Nova Célula</button></div>
          {showCellForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCellForm(false)}></div>
              <div className="bg-white w-full max-w-4xl rounded-[3rem] p-8 md:p-12 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h4 className="text-2xl font-black text-primary uppercase mb-8 border-b border-gray-100 pb-4">{editingCellId ? 'Editar' : 'Nova'} Célula</h4>
                <form onSubmit={handleCellFormSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative group">
                        <div className="w-44 h-44 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-secondary transition-colors">
                          {cellFormData.leaderPhoto ? <img src={cellFormData.leaderPhoto} className="w-full h-full object-cover" alt="Líder" /> : <Camera className="text-gray-300 group-hover:text-secondary" size={40} />}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-secondary text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform"><Upload size={20} /></button>
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nome da Célula</label><input type="text" required value={cellFormData.name} onChange={e => setCellFormData({ ...cellFormData, name: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Líder Principal</label><input type="text" required value={cellFormData.leader} onChange={e => setCellFormData({ ...cellFormData, leader: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tipo</label><select value={cellFormData.type} onChange={e => setCellFormData({ ...cellFormData, type: e.target.value as any })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold appearance-none"><option value="Adulto">Adulto</option><option value="Jovem">Jovem</option><option value="Juvenil">Juvenil</option></select></div>
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Telefone Líder</label><input type="text" value={cellFormData.phone} onChange={e => setCellFormData({ ...cellFormData, phone: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Líder em Treinamento</label><input type="text" value={cellFormData.trainee} onChange={e => setCellFormData({ ...cellFormData, trainee: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2"><Home size={14} className="text-secondary" /> Local e Apoio</h5>
                      <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase ml-1">Anfitrião</label><input type="text" value={cellFormData.host} onChange={e => setCellFormData({ ...cellFormData, host: e.target.value })} className="w-full p-3.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-secondary font-bold text-sm" /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase ml-1">Secretária(o)</label><input type="text" value={cellFormData.secretary} onChange={e => setCellFormData({ ...cellFormData, secretary: e.target.value })} className="w-full p-3.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-secondary font-bold text-sm" /></div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2"><Users size={14} className="text-secondary" /> Equipe de Trabalho (Até 10)</h5>
                      <div className="grid grid-cols-2 gap-2">{Array.from({ length: 10 }).map((_, idx) => (<input key={idx} type="text" placeholder={`Membro ${idx + 1}`} value={cellFormData.team[idx] || ''} onChange={e => handleTeamMemberChange(idx, e.target.value)} className="w-full p-2.5 bg-white border border-gray-100 rounded-lg outline-none focus:border-secondary font-bold text-[10px]" />))}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Endereço Completo</label><input type="text" required value={cellFormData.address} onChange={e => setCellFormData({ ...cellFormData, address: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div>
                    <div className="space-y-4">
                      {/* Reorganização conforme solicitado: Dia e Hora abaixo de Região */}
                      <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cidade</label>
                          <input type="text" value={cellFormData.region} onChange={e => setCellFormData({ ...cellFormData, region: e.target.value })} className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Dia do Encontro</label>
                            <select value={cellFormData.day} onChange={e => setCellFormData({ ...cellFormData, day: e.target.value })} className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold appearance-none">
                              {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Hora do Encontro</label>
                            <input type="time" value={cellFormData.time} onChange={e => setCellFormData({ ...cellFormData, time: e.target.value })} className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4"><button type="button" onClick={() => setShowCellForm(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs">Cancelar</button><button type="submit" className="flex-[2] py-4 bg-secondary text-primary rounded-2xl font-black uppercase text-xs shadow-lg">Salvar Célula</button></div>
                </form>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {cells.map(cell => (
              <div key={cell.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 group hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2"><button onClick={() => handleOpenCellForm(cell)} className="p-2 bg-gray-50 text-secondary rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm"><Pencil size={14} /></button><button onClick={() => { if (confirm("Deseja excluir?")) onDeleteCell(cell.id); }} className="p-2 bg-gray-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={14} /></button></div>
                <div className="w-24 h-24 bg-gray-50 rounded-[1.75rem] flex items-center justify-center mb-6 shadow-inner border border-gray-100 overflow-hidden">{cell.leaderPhoto ? <img src={cell.leaderPhoto} className="w-full h-full object-cover" alt={cell.leader} /> : <MapPin className="text-secondary" size={40} />}</div>
                <h4 className="font-black text-primary text-xl uppercase leading-tight mb-1">{cell.name}</h4><p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">{cell.type}</p>
                <div className="space-y-2 text-[10px] text-gray-500 font-bold uppercase">
                  <div className="flex items-center gap-2"><User size={14} className="text-secondary shrink-0" /> Líder: {cell.leader}</div>{cell.trainee && <div className="flex items-center gap-2"><GraduationCap size={14} className="text-secondary shrink-0" /> Líder em treinamento: {cell.trainee}</div>}<div className="flex items-center gap-2"><Home size={14} className="text-secondary shrink-0" /> Anfitrião: {cell.host || 'Não inf.'}</div>{cell.secretary && <div className="flex items-center gap-2"><PenTool size={14} className="text-secondary shrink-0" /> Secretária: {cell.secretary}</div>}<div className="flex items-center gap-2"><MapPin size={14} className="text-secondary shrink-0" /> End.: {cell.address}</div><div className="flex items-center gap-2"><Clock size={14} className="text-secondary shrink-0" /> {cell.day} às {cell.time}</div><div className="flex items-start gap-2"><Users size={14} className="text-secondary shrink-0 mt-0.5" /><div>Equipe: {cell.team?.length || 0} pessoas<div className="flex flex-wrap gap-1 mt-1">{cell.team?.map((m, i) => (<span key={i} className="bg-gray-100 text-[8px] px-1.5 py-0.5 rounded text-gray-600">{m}</span>))}</div></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'admin-metricas' && (
        <div className="space-y-10 max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div><h3 className="text-3xl font-black text-primary uppercase tracking-tighter">Dashboard de Métricas</h3><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Dados consolidados da rede Viver em Cristo</p></div>
            <div className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-2 border-r border-gray-100"><Layers size={16} className="text-secondary" /><select value={filterType} onChange={e => { setFilterType(e.target.value as any); setFilterCell('Todas'); }} className="text-[10px] font-black uppercase outline-none bg-transparent appearance-none pr-4"><option value="Todas">Tipo (Todas)</option><option value="Adulto">Adulto</option><option value="Jovem">Jovem</option><option value="Juvenil">Juvenil</option></select></div>
              <div className="flex items-center gap-2 px-2 border-r border-gray-100"><MapPin size={16} className="text-secondary" /><select value={filterCell} onChange={e => setFilterCell(e.target.value)} className="text-[10px] font-black uppercase outline-none bg-transparent appearance-none pr-4"><option value="Todas">Célula (Todas)</option>{cells.filter(c => filterType === 'Todas' || c.type === filterType).map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}</select></div>
              <div className="flex items-center gap-2 px-2 border-r border-gray-100"><Clock size={16} className="text-secondary" /><select value={reportFilterPeriod} onChange={e => setReportFilterPeriod(e.target.value)} className="text-[10px] font-black uppercase outline-none bg-transparent appearance-none pr-4"><option value="all">Período (Todos)</option><option value="week">Esta Semana</option><option value="month">Este Mês</option><option value="bimester">Este Bimestre</option><option value="quarter">Este Trimestre</option><option value="semester">Este Semestre</option><option value="year">Anual</option></select></div>
              <div className="flex items-center gap-2 px-2"><Calendar size={16} className="text-secondary" /><select value={reportFilterYear} onChange={e => setReportFilterYear(e.target.value)} className="text-[10px] font-black uppercase outline-none bg-transparent appearance-none pr-4"><option value="all">Ano (Todos)</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2 text-primary opacity-60"><Users size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Total Presentes</p></div><p className="text-4xl font-black text-primary tracking-tighter">{metricsData.totals.adults}</p></div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2 text-secondary"><Users size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Visitantes</p></div><p className="text-4xl font-black text-secondary tracking-tighter">{metricsData.totals.visitors}</p></div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2 text-amber-500"><Sparkles size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Visitantes 1ª Vez</p></div><p className="text-4xl font-black text-amber-500 tracking-tighter">{metricsData.totals.firstTime}</p></div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2 text-red-500"><Heart size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Conversões</p></div><p className="text-4xl font-black text-red-500 tracking-tighter">{metricsData.totals.conversions}</p></div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2 text-indigo-500"><Clock size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Visitas</p></div><p className="text-4xl font-black text-indigo-500 tracking-tighter">{metricsData.totals.visits}</p></div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2 text-blue-500"><Baby size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Crianças</p></div><p className="text-4xl font-black text-blue-500 tracking-tighter">{metricsData.totals.children}</p></div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-2 mb-2 text-green-600"><DollarSign size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Ofertas Adultos</p></div><p className="text-2xl font-black text-green-600 tracking-tighter">R$ {metricsData.totals.offeringAdult.toFixed(2)}</p></div>
            <div className="bg-primary p-6 rounded-[2rem] text-white shadow-xl shadow-black/20 group hover:scale-[1.02] transition-transform"><div className="flex items-center gap-2 mb-2 text-secondary"><Landmark size={16} /><p className="text-[9px] font-black uppercase tracking-widest">Ofertas Kids</p></div><p className="text-2xl font-black tracking-tighter">R$ {metricsData.totals.offeringKids.toFixed(2)}</p></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">Presença Consolidada</h4>
                <div className="text-[10px] font-black text-primary">Total: {metricsData.totalPeople} vidas</div>
              </div>
              <div className="h-64 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} verticalAlign="bottom" align="center" />
                    <Bar dataKey="1ª Vez" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={40} />
                    <Bar dataKey="Total Presentes" fill="#000000" radius={[10, 10, 0, 0]} barSize={40} />
                    <Bar dataKey="Visitantes" fill="#00b4bc" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm"><h4 className="text-xs font-black uppercase text-gray-400 mb-8 tracking-widest">Perfil de Visitantes</h4><div className="h-64 md:h-80 w-full"><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={metricsData.visitorProfileData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="value">{metricsData.visitorProfileData.map((entry, index) => <ReCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} /><Legend iconType="circle" layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} /></RePieChart></ResponsiveContainer></div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm"><h4 className="text-xs font-black uppercase text-gray-400 mb-8 tracking-widest flex items-center gap-2"><Droplets size={14} /> Consolidação: Batismo</h4><div className="h-56 md:h-64 w-full"><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={metricsData.baptizedPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">{metricsData.baptizedPieData.map((entry, index) => <ReCell key={`cell-bat-${index}`} fill={CONSOLIDATION_COLORS[index % CONSOLIDATION_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} /><Legend iconType="circle" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} /></RePieChart></ResponsiveContainer></div></div>
            <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm"><h4 className="text-xs font-black uppercase text-gray-400 mb-8 tracking-widest flex items-center gap-2"><Footprints size={14} /> Consolidação: Encontro</h4><div className="h-56 md:h-64 w-full"><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={metricsData.encounterPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">{metricsData.encounterPieData.map((entry, index) => <ReCell key={`cell-enc-${index}`} fill={CONSOLIDATION_COLORS[index % CONSOLIDATION_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} /><Legend iconType="circle" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} /></RePieChart></ResponsiveContainer></div></div>
          </div>
          <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm"><div className="flex items-center gap-3 mb-8"><Activity className="text-secondary" size={28} /><div><h4 className="text-xl font-black text-primary uppercase tracking-tighter">Análise de Nível de Atenção</h4><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status baseado na regularidade de visitantes</p></div></div><div className="space-y-4">{metricsData.attentionLevels.map((cell, idx) => (<div key={idx} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all group"><div className="flex-1 space-y-2"><div className="flex items-center gap-3"><p className="font-black text-primary uppercase text-sm md:text-base leading-tight tracking-tight">{cell.name}</p><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border ${cell.bgColor} ${cell.color} border-current/20`}>{cell.label}</span></div><p className="text-xs font-bold text-gray-500 leading-relaxed"><span className="text-primary/40 font-black uppercase text-[9px] tracking-wider block mb-1">Análise Automática</span>{cell.reason}</p></div><div className="flex items-center gap-6 md:border-l border-gray-200 md:pl-8"><div className="text-center"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Média Visitantes</p><div className="flex items-baseline justify-center gap-1"><p className="text-xl font-black text-primary tracking-tighter">{cell.avgVisitors.toFixed(1)}</p><span className="text-[8px] font-bold text-gray-400 uppercase">/sem</span></div></div><div className="text-center"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Média Frequência</p><div className="flex items-baseline justify-center gap-1"><p className="text-xl font-black text-secondary tracking-tighter">{cell.avgAttendance.toFixed(1)}</p><span className="text-[8px] font-bold text-gray-400 uppercase">/sem</span></div></div></div></div>))}{metricsData.attentionLevels.length === 0 && (<div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl"><AlertCircle size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sem dados para análise no período selecionado</p></div>)}</div></div>
        </div>
      )}

      {activeTab === 'admin-batismo' && (
        <div className="space-y-8 max-w-5xl mx-auto px-4">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm mb-8"><h3 className="text-2xl font-black text-primary uppercase mb-8 flex items-center gap-3"><Droplets size={28} className="text-secondary" /> Novo Candidato ao Batismo</h3><form onSubmit={handleAddBaptismCandidate} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nome Completo</label><input type="text" required placeholder="Digite o nome..." value={baptismForm.name} onChange={e => setBaptismForm({ ...baptismForm, name: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">WhatsApp</label><input type="text" placeholder="31 90000-0000" value={baptismForm.whatsapp} onChange={e => setBaptismForm({ ...baptismForm, whatsapp: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Data do Batismo</label><input type="date" required value={baptismForm.date} onChange={e => setBaptismForm({ ...baptismForm, date: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Célula Associada</label><select required value={baptismForm.cellName} onChange={e => setBaptismForm({ ...baptismForm, cellName: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold appearance-none"><option value="">Selecione a célula...</option>{cells.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div></div><button type="submit" className="w-full bg-secondary text-primary py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg active:scale-[0.98]">Cadastrar Candidato</button></form></div>
          <div className="space-y-4"><h3 className="text-xl font-black text-primary uppercase px-4 flex items-center gap-2">Candidatos Cadastrados</h3>{baptisms.length === 0 ? (<div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-gray-100"><Droplets size={48} className="mx-auto text-gray-200 mb-4 opacity-20" /><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhum candidato aguardando batismo</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{baptisms.map(baptism => (<div key={baptism.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden group"><button onClick={() => { if (confirm("Deseja excluir?")) onDeleteReport(baptism.id); }} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-opacity bg-white/80 backdrop-blur rounded-xl shadow-sm"><Trash2 size={16} /></button><div className="space-y-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center"><User size={20} /></div><div><p className="font-black text-primary uppercase text-sm leading-tight">{baptism.name}</p><p className="text-[9px] font-black text-secondary uppercase tracking-widest">{baptism.cellName}</p></div></div><div className="pt-2 flex items-center gap-4 border-t border-gray-50"><div className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-400" /><p className="text-[10px] font-bold text-gray-500">{new Date(baptism.date).toLocaleDateString()}</p></div>{baptism.whatsapp && (<a href={`https://wa.me/55${baptism.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-1.5 text-green-500 hover:underline"><MessageCircle size={12} /><p className="text-[10px] font-bold">WhatsApp</p></a>)}</div></div></div>))}</div>)}</div>
        </div>
      )}

      {activeTab === 'admin-compartilhamentos' && (
        <div className="space-y-10 max-w-5xl mx-auto px-4">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm"><h3 className="text-2xl font-black text-primary uppercase mb-8 flex items-center gap-3"><Share2 size={28} className="text-secondary" /> Compartilhar Material</h3><form onSubmit={handleAddShareSubmit} className="space-y-6"><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Título do Material</label><input type="text" required placeholder="Ex: Estudo da Semana - Salmos 23" value={shareForm.title} onChange={e => setShareForm({ ...shareForm, title: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Descrição Breve</label><textarea placeholder="Explique do que se trata o material..." rows={2} value={shareForm.description} onChange={e => setShareForm({ ...shareForm, description: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-medium resize-none" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Anexar Arquivo/Link</label><div className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all group" onClick={() => shareFileInputRef.current?.click()}><input type="file" ref={shareFileInputRef} className="hidden" onChange={handleShareFileUpload} /><div className="flex flex-col items-center"><Upload size={32} className="text-gray-300 group-hover:text-secondary mb-2" /><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-secondary">{shareForm.fileUrl ? "Arquivo carregado!" : "Clique para selecionar o arquivo"}</p></div></div></div><button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98]">Publicar Compartilhamento</button></form></div>
          <div className="space-y-4"><h3 className="text-xl font-black text-primary uppercase px-4 flex items-center gap-2">Materiais Publicados</h3>{shares.length === 0 ? (<div className="bg-white p-20 rounded-[3.5rem] text-center border-2 border-dashed border-gray-100"><Share2 size={48} className="mx-auto text-gray-200 mb-4 opacity-20" /><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhum material compartilhado ainda</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{shares.map(share => (<div key={share.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"><button onClick={() => { if (confirm("Deseja excluir este material?")) onDeleteShare(share.id); }} className="absolute top-4 right-4 p-2.5 text-gray-300 hover:text-red-500 transition-opacity bg-white/80 backdrop-blur rounded-xl shadow-sm"><Trash2 size={18} /></button><div className="flex-1"><div className="flex items-center gap-3 mb-4"><div className="p-3 bg-secondary/10 text-secondary rounded-2xl"><FileText size={24} /></div><div><h4 className="font-black text-primary uppercase text-sm leading-tight">{share.title}</h4><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(share.date).toLocaleDateString()}</p></div></div><p className="text-xs font-medium text-gray-500 leading-relaxed mb-6">{share.description}</p><div className="flex items-center justify-between pt-4 border-t border-gray-50"><a href={share.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity"><Download size={14} /> Baixar Arquivo</a></div></div></div>))}</div>)}</div>
        </div>
      )}

      {activeTab === 'admin-metas' && (
        <div className="space-y-10 max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">Metas e Objetivos</h3>
            <button onClick={() => handleOpenGoalForm()} className="bg-secondary text-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-secondary/10"><Plus size={18} /> Nova Meta</button>
          </div>
          {showGoalForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGoalForm(false)}></div>
              <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h4 className="text-2xl font-black text-primary uppercase mb-8">{editingGoalId ? 'Editar' : 'Nova'} Meta</h4>
                <form onSubmit={handleGoalFormSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Título da Meta</label>
                    <input type="text" required value={goalFormData.name} onChange={e => setGoalFormData({ ...goalFormData, name: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tipo de Célula</label>
                      <select value={goalFormData.cellType} onChange={e => setGoalFormData({ ...goalFormData, cellType: e.target.value as any, cellId: '' })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold appearance-none">
                        <option value="Todas">Todas</option>
                        <option value="Adulto">Adulto</option>
                        <option value="Jovem">Jovem</option>
                        <option value="Juvenil">Juvenil</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Célula Específica (Opcional)</label>
                      <select value={goalFormData.cellId} onChange={e => setGoalFormData({ ...goalFormData, cellId: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold appearance-none">
                        <option value="">Nenhuma (Geral)</option>
                        {cells.filter(c => goalFormData.cellType === 'Todas' || c.type === goalFormData.cellType).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Início</label>
                      <input type="date" required value={goalFormData.startDate} onChange={e => setGoalFormData({ ...goalFormData, startDate: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Fim</label>
                      <input type="date" required value={goalFormData.endDate} onChange={e => setGoalFormData({ ...goalFormData, endDate: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Objetivo (Números ou Descrição)</label>
                    <input type="text" required value={goalFormData.objective} onChange={e => setGoalFormData({ ...goalFormData, objective: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowGoalForm(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs">Cancelar</button>
                    <button type="submit" className="flex-[2] py-4 bg-secondary text-primary rounded-2xl font-black uppercase text-xs shadow-lg">Salvar Meta</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(goals || []).map(goal => {
              const associatedCell = cells.find(c => c.id === goal.cellId);
              return (
                <div key={goal.id} className={`p-8 rounded-[2.5rem] border ${goal.isCompleted ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'} shadow-sm relative group overflow-hidden`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${goal.isCompleted ? 'bg-green-500 text-white' : 'bg-secondary/10 text-secondary'}`}><Target size={24} /></div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenGoalForm(goal)} className="p-2 text-gray-300 hover:text-secondary"><Pencil size={14} /></button>
                      <button onClick={() => onDeleteGoal(goal.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-[8px] font-black text-secondary uppercase bg-secondary/5 px-2 py-1 rounded border border-secondary/10 tracking-widest">
                      {goal.cellType} {associatedCell ? ` - ${associatedCell.name}` : ''}
                    </span>
                  </div>
                  <h4 className={`text-xl font-black uppercase mb-2 ${goal.isCompleted ? 'text-green-900 line-through opacity-50' : 'text-primary'}`}>{goal.name}</h4>
                  <p className="text-sm font-bold text-gray-500 mb-6">{goal.objective}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(goal.startDate).toLocaleDateString()} — {new Date(goal.endDate).toLocaleDateString()}</div>
                    <button onClick={() => toggleGoalCompletion(goal)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${goal.isCompleted ? 'bg-green-100 text-green-700' : 'bg-primary text-white hover:bg-black'}`}>{goal.isCompleted ? 'Concluída' : 'Marcar Concluída'}</button>
                  </div>
                </div>
              );
            })}
            {(goals || []).length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                <Target size={48} className="mx-auto text-gray-100 mb-4" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nenhuma meta cadastrada</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admin-avisos' && (
        <div className="space-y-8 max-w-4xl mx-auto"><div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm"><h3 className="text-2xl font-black text-primary uppercase mb-8 flex items-center gap-3"><Megaphone size={28} className="text-secondary" /> Enviar Comunicado</h3><div className="space-y-6"><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Para quem?</label><select value={noticeForm.recipientId} onChange={e => setNoticeForm({ ...noticeForm, recipientId: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold appearance-none"><option value="all">Todos os Líderes</option>{cells.map(c => <option key={c.id} value={c.id}>{c.leader} ({c.name})</option>)}</select></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Título do Aviso</label><input type="text" placeholder="Ex: Reunião de Líderes Extra" value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mensagem</label><textarea placeholder="Escreva aqui..." rows={4} value={noticeForm.message} onChange={e => setNoticeForm({ ...noticeForm, message: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-medium resize-none" /></div><div className="flex flex-col sm:flex-row gap-4 pt-4"><button onClick={handleSendAppNotice} className="flex-1 bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"><BellRing size={18} /> Notificar no App</button><button onClick={handleSendWhatsAppNotice} className="flex-1 bg-green-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2"><MessageCircle size={18} /> Enviar via WhatsApp</button></div></div></div></div>
      )}
      {activeTab === 'admin-eventos' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          <h3 className="text-3xl font-black text-primary uppercase tracking-tighter px-4">Gerenciar Eventos</h3>

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mx-4">
            <h4 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest">Novo Evento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Título</label>
                <input type="text" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Data</label>
                <input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Local</label>
                <input type="text" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Público-Alvo (Tipo de Célula)</label>
                <select value={eventForm.cellType} onChange={e => setEventForm({ ...eventForm, cellType: e.target.value as any })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-bold appearance-none">
                  <option value="Todas">Todas as Células</option>
                  <option value="Adulto">Células Adultas</option>
                  <option value="Jovem">Células Jovens</option>
                  <option value="Juvenil">Células Juvenis</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Descrição</label>
                <textarea rows={3} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-secondary font-medium" />
              </div>
            </div>
            <button
              onClick={() => {
                if (!eventForm.title || !eventForm.date) return alert("Preencha título e data.");
                onAddEvent(eventForm);
                setEventForm({ title: '', description: '', date: '', location: '', cellType: 'Todas' });
              }}
              className="w-full py-4 bg-secondary text-primary rounded-2xl font-black uppercase text-xs shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
            >
              <Calendar size={18} /> Criar Evento
            </button>
          </div>

          <div className="space-y-12">
            {/* Seção Próximos */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase text-gray-400 px-4 tracking-widest">Próximos Eventos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                {events.filter(e => e.date >= new Date().toISOString().split('T')[0]).length === 0 ? (
                  <div className="col-span-full bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                    <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Nenhum evento agendado</p>
                  </div>
                ) : (
                  events.filter(e => e.date >= new Date().toISOString().split('T')[0]).map(event => (
                    <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
                      <button onClick={() => onDeleteEvent(event.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-secondary/10 text-secondary p-3 rounded-2xl"><Calendar size={24} /></div>
                        <div>
                          <h4 className="font-black text-primary uppercase leading-tight">{event.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(event.date + 'T12:00:00').toLocaleDateString()}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${event.cellType === 'Todas' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>{event.cellType}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-4">{event.description}</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                        <MapPin size={14} className="text-secondary" /> {event.location || 'Local não definido'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Seção Realizados */}
            {events.some(e => e.date < new Date().toISOString().split('T')[0]) && (
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase text-amber-500 px-4 tracking-widest">Eventos Realizados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-12">
                  {events
                    .filter(e => e.date < new Date().toISOString().split('T')[0])
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(event => (
                      <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all overflow-hidden grayscale opacity-70">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                        <button onClick={() => onDeleteEvent(event.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl"><CheckCircle2 size={24} /></div>
                          <div>
                            <h4 className="font-black text-gray-500 uppercase leading-tight">{event.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(event.date + 'T12:00:00').toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-amber-600 uppercase">Evento concluído</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
