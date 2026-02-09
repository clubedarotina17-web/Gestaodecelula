
// Completed the component implementation and added the missing default export to fix the import error in App.tsx.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, FileText, Download, User, Users, MapPin, Calendar, Clock, Star, Mic, MicOff, Phone, Plus, CheckCircle2, Save, Pencil, MessageCircle, AlertCircle, TrendingUp, Search, Filter, X, Baby, CheckCircle, Heart, DollarSign, Footprints, Sparkles, Layers, Landmark, Share2 } from 'lucide-react';
import { Cell, Report, Share, Visitor, AppEvent } from '../types';

interface LeaderDashboardProps {
  cell: Cell;
  reports: Report[];
  shares: Share[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddReport: (report: Omit<Report, 'id'>) => void;
  onUpdateReport: (report: Report) => void;
  onDeleteReport: (id: string) => void;
  onNotify: (title: string, message: string, type: 'visitor' | 'late' | 'event' | 'info' | 'notice', phone?: string) => void;
  events: AppEvent[];
}

const LeaderDashboard: React.FC<LeaderDashboardProps> = ({ cell, reports, shares, events = [], activeTab, setActiveTab, onAddReport, onUpdateReport, onNotify }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterType, setFilterType] = useState<string>(cell.type);
  const [filterCellName, setFilterCellName] = useState<string>(cell.name);

  const getLocalDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    date: getLocalDate(),
    attendance: '',
    visitors: '',
    conversions: '0',
    weeklyVisits: '0',
    firstTimeVisitorsCount: '0',
    childrenCount: '0',
    offering: '',
    kidsOffering: '',
    summary: ''
  });

  const [firstTimeVisitors, setFirstTimeVisitors] = useState<Visitor[]>([]);
  const [savedVisitors, setSavedVisitors] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Verifica duplicidade sempre que a data mudar
  const isDuplicateDate = useMemo(() => {
    return reports.some(r => r.cellId === cell.id && r.date === formData.date && r.id !== editingId);
  }, [formData.date, reports, cell.id, editingId]);

  useEffect(() => {
    if (isDuplicateDate) {
      setSubmitError(`Já existe um relatório para o dia ${new Date(formData.date + 'T12:00:00').toLocaleDateString()}.`);
    } else {
      setSubmitError(null);
    }
  }, [isDuplicateDate, formData.date]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) {
          setFormData(prev => ({ ...prev, summary: prev.summary + (prev.summary ? ' ' : '') + finalTranscript }));
        }
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const handleEditReport = (report: Report) => {
    setEditingId(report.id);
    setFormData({
      date: report.date,
      attendance: report.attendance.toString(),
      visitors: report.visitors.toString(),
      conversions: report.conversions.toString(),
      weeklyVisits: report.weeklyVisits.toString(),
      firstTimeVisitorsCount: report.firstTimeVisitorsCount.toString(),
      childrenCount: (report.childrenCount || 0).toString(),
      offering: report.offering.toString(),
      kidsOffering: (report.kidsOffering || 0).toString(),
      summary: report.summary
    });
    setFirstTimeVisitors(report.firstTimeVisitorsList || []);
    setSavedVisitors((report.firstTimeVisitorsList || []).map((_, i) => i));
    setActiveTab('cadastrar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      date: getLocalDate(),
      attendance: '',
      visitors: '',
      conversions: '0',
      weeklyVisits: '0',
      firstTimeVisitorsCount: '0',
      childrenCount: '0',
      offering: '',
      kidsOffering: '',
      summary: ''
    });
    setFirstTimeVisitors([]);
    setSavedVisitors([]);
    setSubmitError(null);
  };

  const toggleRecording = () => {
    if (isRecording) recognitionRef.current?.stop();
    else { setIsRecording(true); recognitionRef.current?.start(); }
  };

  const handleFirstTimeCountChange = (val: string) => {
    const count = parseInt(val) || 0;
    setFormData({ ...formData, firstTimeVisitorsCount: val });
    const newList = [...firstTimeVisitors];
    if (count > newList.length) {
      for (let i = newList.length; i < count; i++) newList.push({ name: '', phone: '', address: '', isBaptized: false, hasAttendedEncounter: false });
    } else if (count < newList.length) {
      newList.splice(count);
      setSavedVisitors(prev => prev.filter(idx => idx < count));
    }
    setFirstTimeVisitors(newList);
  };

  const updateVisitor = (index: number, field: keyof Visitor, value: any) => {
    const newList = [...firstTimeVisitors];
    let processedValue = value;
    if (field === 'phone') processedValue = value.replace(/\D/g, '');
    newList[index] = { ...newList[index], [field]: processedValue };
    setFirstTimeVisitors(newList);
    setSavedVisitors(prev => prev.filter(i => i !== index));
  };

  const handleSaveVisitor = (index: number) => {
    const visitor = firstTimeVisitors[index];
    if (visitor.name.trim().split(/\s+/).length < 2) {
      alert("Por favor, preencha o NOME COMPLETO.");
      return;
    }
    if (!visitor.phone || visitor.phone.length < 10) {
      alert("Por favor, preencha o WHATSAPP corretamente.");
      return;
    }
    if (!visitor.address.trim()) {
      alert("Por favor, preencha o ENDEREÇO.");
      return;
    }
    setSavedVisitors(prev => [...new Set([...prev, index])]);
  };

  const sendWhatsAppWelcome = (visitor: Visitor) => {
    if (!visitor.phone) return;
    const cleanPhone = visitor.phone.replace(/\D/g, '');
    const message = `Olá ${visitor.name}! Que alegria ter você conosco na Célula ${cell.name}. Volte sempre!`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getDayOfWeek = (dateString: string) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const d = new Date(dateString + 'T12:00:00');
    return days[d.getDay()];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDuplicateDate) {
      alert(`Erro: Já existe um relatório cadastrado para esta célula na data ${new Date(formData.date + 'T12:00:00').toLocaleDateString()}. Cada célula só pode enviar um relatório por data.`);
      return;
    }

    if (parseInt(formData.firstTimeVisitorsCount) > 0 && savedVisitors.length < firstTimeVisitors.length) {
      alert("Por favor, salve todos os visitantes.");
      return;
    }
    const selectedDay = getDayOfWeek(formData.date);
    const cellMeetingDay = cell.day.split(' – ')[0].trim();
    const isLate = selectedDay.toLowerCase() !== cellMeetingDay.toLowerCase();
    const payload = {
      cellId: cell.id,
      cellName: cell.name,
      date: formData.date,
      attendance: Number(formData.attendance),
      visitors: Number(formData.visitors),
      conversions: Number(formData.conversions),
      weeklyVisits: Number(formData.weeklyVisits),
      firstTimeVisitorsCount: Number(formData.firstTimeVisitorsCount),
      firstTimeVisitorsList: firstTimeVisitors,
      childrenCount: (cell.type === 'Jovem' || cell.type === 'Juvenil') ? 0 : Number(formData.childrenCount),
      offering: Number(formData.offering),
      kidsOffering: (cell.type === 'Jovem' || cell.type === 'Juvenil') ? 0 : Number(formData.kidsOffering || 0),
      summary: formData.summary,
      isLate: isLate
    };
    if (editingId) {
      onUpdateReport({ ...payload, id: editingId });
      setEditingId(null);
    } else onAddReport(payload);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
    cancelEdit();
  };

  const filteredReportsList = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return reports.filter(r => {
      if (r.cellId !== cell.id) return false;

      const matchType = filterType === 'Todas' || cell.type === filterType;
      const matchCellName = filterCellName === 'Todas' || cell.name === filterCellName;

      if (!matchType || !matchCellName) return false;

      const reportDate = new Date(r.date + 'T12:00:00');
      const reportYear = reportDate.getFullYear();

      let periodMatch = true;
      if (filterPeriod !== 'all') {
        const diffTime = Math.abs(now.getTime() - reportDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterPeriod) {
          case 'week':
            periodMatch = diffDays <= 7;
            break;
          case 'month':
            periodMatch = reportDate.getMonth() === now.getMonth() && reportYear === now.getFullYear();
            break;
          case 'quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const reportQuarter = Math.floor(reportDate.getMonth() / 3);
            periodMatch = currentQuarter === reportQuarter && reportYear === now.getFullYear();
            break;
          case 'semester':
            const currentSemester = now.getMonth() < 6 ? 0 : 1;
            const reportSemester = reportDate.getMonth() < 6 ? 0 : 1;
            periodMatch = currentSemester === reportSemester && reportYear === now.getFullYear();
            break;
          case 'year':
            periodMatch = reportYear === now.getFullYear();
            break;
          default:
            if (!isNaN(parseInt(filterPeriod))) {
              periodMatch = (reportDate.getMonth() + 1).toString() === filterPeriod && reportYear.toString() === filterYear;
            }
        }
      }

      const yearMatch = filterYear === 'all' || reportYear.toString() === filterYear;
      return periodMatch && yearMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, cell.id, cell.type, cell.name, filterPeriod, filterYear, filterType, filterCellName]);

  const isJovemOuJuvenil = cell.type === 'Jovem' || cell.type === 'Juvenil';

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSuccessMessage(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative z-10 flex flex-col items-center text-center max-w-xs w-full border-t-8 border-secondary">
            <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 ring-4 ring-secondary/5">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-black text-primary uppercase mb-1">Enviado!</h3>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Relatório registrado.</p>
          </div>
        </div>
      )}

      {activeTab === 'cadastrar' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 md:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-xl font-black text-primary flex items-center gap-2">
                  <FileText className="text-secondary" size={20} /> {editingId ? 'Editar' : 'Novo Relatório'}
                </h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{cell.name}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="text-red-500 shrink-0" size={20} />
                  <p className="text-red-700 text-xs font-bold leading-tight">{submitError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 ml-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:border-secondary text-sm font-medium ${isDuplicateDate ? 'border-red-200 text-red-500' : 'border-gray-50'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 ml-1">Total Presentes</label>
                  <input type="number" required placeholder="0" value={formData.attendance} onChange={(e) => setFormData({ ...formData, attendance: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-secondary text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 ml-1">Visitantes (Total)</label>
                  <input type="number" required placeholder="0" value={formData.visitors} onChange={(e) => setFormData({ ...formData, visitors: e.target.value })} className="w-full p-3.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-secondary text-sm font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-secondary ml-1">Visitantes (Pela 1ª vez)</label>
                  <input type="number" placeholder="0" value={formData.firstTimeVisitorsCount} onChange={(e) => handleFirstTimeCountChange(e.target.value)} className="w-full p-3.5 bg-white border-2 border-secondary/10 rounded-xl outline-none focus:border-secondary text-sm font-bold" />
                </div>
                {firstTimeVisitors.length > 0 && (
                  <div className="col-span-full space-y-3 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {firstTimeVisitors.map((visitor, idx) => (
                        <div key={idx} className={`p-5 rounded-3xl border transition-all ${savedVisitors.includes(idx) ? 'bg-white border-green-50 shadow-lg shadow-green-500/5' : 'bg-gray-50 border-gray-50 shadow-sm'}`}>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-secondary uppercase bg-secondary/10 px-3 py-1 rounded-full tracking-widest border border-secondary/20">Visitante {idx + 1}</span>
                            {savedVisitors.includes(idx) && (
                              <button type="button" onClick={() => setSavedVisitors(prev => prev.filter(i => i !== idx))} className="p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-xl transition-all"><Pencil size={14} /></button>
                            )}
                          </div>

                          {savedVisitors.includes(idx) ? (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 space-y-1">
                                <p className="font-black text-primary text-base leading-tight break-words">{visitor.name}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight break-words">{visitor.address}</p>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded shadow-sm border ${visitor.isBaptized ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}`}>
                                    {visitor.isBaptized ? 'BATIZADO' : 'NÃO BATIZADO'}
                                  </span>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded shadow-sm border ${visitor.hasAttendedEncounter ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-gray-400 text-white border-gray-500'}`}>
                                    {visitor.hasAttendedEncounter ? 'FEZ O ENCONTRO' : 'NÃO FEZ O ENCONTRO'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => sendWhatsAppWelcome(visitor)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                                >
                                  <MessageCircle size={12} /> WhatsApp
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Nome Completo</label>
                                <input placeholder="Ex: Maria Oliveira" value={visitor.name} onChange={(e) => updateVisitor(idx, 'name', e.target.value)} className="w-full p-2.5 bg-white border border-gray-100 rounded-lg text-xs font-bold outline-none focus:border-secondary shadow-sm" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase ml-1">WhatsApp</label>
                                  <input placeholder="31 99999-9999" value={visitor.phone} onChange={(e) => updateVisitor(idx, 'phone', e.target.value)} className="w-full p-2.5 bg-white border border-gray-100 rounded-lg text-xs font-bold outline-none focus:border-secondary shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Batizado?</label>
                                  <div className="flex bg-gray-100 rounded-lg p-0.5 h-10 shadow-inner">
                                    <button
                                      type="button"
                                      onClick={() => updateVisitor(idx, 'isBaptized', true)}
                                      className={`flex-1 rounded-md text-[9px] font-black uppercase transition-all flex items-center justify-center ${visitor.isBaptized ? 'bg-green-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                      Sim
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateVisitor(idx, 'isBaptized', false)}
                                      className={`flex-1 rounded-md text-[9px] font-black uppercase transition-all flex items-center justify-center ${!visitor.isBaptized ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                      Não
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Já foi ao encontro?</label>
                                <div className="flex bg-gray-100 rounded-lg p-0.5 h-10 shadow-inner">
                                  <button
                                    type="button"
                                    onClick={() => updateVisitor(idx, 'hasAttendedEncounter', true)}
                                    className={`flex-1 rounded-md text-[9px] font-black uppercase transition-all flex items-center justify-center ${visitor.hasAttendedEncounter ? 'bg-secondary text-primary shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateVisitor(idx, 'hasAttendedEncounter', false)}
                                    className={`flex-1 rounded-md text-[9px] font-black uppercase transition-all flex items-center justify-center ${!visitor.hasAttendedEncounter ? 'bg-gray-400 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    Não
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Endereço (Rua, Bairro)</label>
                                <input placeholder="Ex: Rua A, 100 - Bairro Centro" value={visitor.address} onChange={(e) => updateVisitor(idx, 'address', e.target.value)} className="w-full p-2.5 bg-white border border-gray-100 rounded-lg text-xs font-medium outline-none focus:border-secondary shadow-sm" />
                              </div>
                              <button type="button" onClick={() => handleSaveVisitor(idx)} className="w-full py-3 bg-secondary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-secondary/20">Salvar Visitante {idx + 1}</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-1"><label className="text-[11px] font-bold text-gray-700 ml-1">Conversões</label><input type="number" placeholder="0" value={formData.conversions} onChange={(e) => setFormData({ ...formData, conversions: e.target.value })} className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-medium" /></div>
                <div className="space-y-1"><label className="text-[11px] font-bold text-gray-700 ml-1">Visitas</label><input type="number" placeholder="0" value={formData.weeklyVisits} onChange={(e) => setFormData({ ...formData, weeklyVisits: e.target.value })} className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold" /></div>

                {!isJovemOuJuvenil && (
                  <div className="space-y-1"><label className="text-[11px] font-bold text-blue-500 ml-1">Crianças (Total)</label><input type="number" placeholder="0" value={formData.childrenCount} onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value })} className="w-full p-3.5 bg-white border-2 border-blue-50 rounded-xl outline-none focus:border-blue-400 text-sm font-bold" /></div>
                )}

                <div className="space-y-1"><label className="text-[11px] font-bold text-gray-700 ml-1">Oferta (R$)</label><input type="number" step="0.01" value={formData.offering} onChange={(e) => setFormData({ ...formData, offering: e.target.value })} className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold" /></div>

                {!isJovemOuJuvenil && (
                  <div className="space-y-1"><label className="text-[11px] font-bold text-blue-500 ml-1">Oferta Kids (R$)</label><input type="number" step="0.01" placeholder="0.00" value={formData.kidsOffering} onChange={(e) => setFormData({ ...formData, kidsOffering: e.target.value })} className="w-full p-3.5 bg-white border-2 border-blue-50 rounded-xl outline-none focus:border-blue-400 text-sm font-bold" /></div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><label className="text-[11px] font-bold text-gray-700">Resumo / Testemunhos</label><button type="button" onClick={toggleRecording} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${isRecording ? 'bg-red-500 text-white' : 'bg-secondary/10 text-secondary'}`}>{isRecording ? 'Ouvindo...' : 'Narrar'}</button></div>
                <textarea rows={5} placeholder="O que Deus fez?..." value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-medium resize-none break-words whitespace-pre-wrap overflow-hidden" />
              </div>
              <div className="flex gap-3 pt-2">
                {editingId && <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold uppercase text-xs">Cancelar</button>}
                <button
                  type="submit"
                  disabled={isDuplicateDate}
                  className={`flex-[2] py-4 rounded-xl font-black text-base uppercase shadow-lg transition-all ${isDuplicateDate ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/90'}`}
                >
                  {isDuplicateDate ? 'Relatório já enviado' : 'Enviar Relatório'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'relatorios' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
            <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">Relatórios Cadastrados</h3>
            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm">
              <div className="flex items-center gap-1.5 px-2 border-r border-gray-100">
                <Layers size={14} className="text-secondary opacity-60" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none p-1 appearance-none pr-5 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%2300b4bc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:8px] bg-right bg-no-repeat">
                  <option value={cell.type}>{cell.type}</option>
                  <option value="Todas">Todas</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 px-2 border-r border-gray-100">
                <MapPin size={14} className="text-secondary opacity-60" />
                <select value={filterCellName} onChange={(e) => setFilterCellName(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none p-1 appearance-none pr-5 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%2300b4bc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:8px] bg-right bg-no-repeat">
                  <option value={cell.name}>{cell.name}</option>
                  <option value="Todas">Todas</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 px-2 border-r border-gray-100">
                <Calendar size={14} className="text-secondary opacity-60" />
                <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none p-1.5 appearance-none pr-5 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%2300b4bc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:8px] bg-right bg-no-repeat">
                  <option value="all">Período (Todos)</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                  <option value="quarter">Este Trimestre</option>
                  <option value="semester">Este Semestre</option>
                  <option value="year">Anual ({new Date().getFullYear()})</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 px-2">
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none p-1.5 appearance-none pr-5 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L6%206L11%201%22%20stroke%3D%22%2300b4bc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:8px] bg-right bg-no-repeat">
                  <option value="all">Ano (Todos)</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {filteredReportsList.length === 0 ? (
              <div className="bg-white p-20 rounded-[2rem] text-center border-2 border-dashed border-gray-100">
                <Search className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Nenhum relatório encontrado neste período</p>
              </div>
            ) : (
              filteredReportsList.map(report => (
                <div key={report.id} className="bg-white rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                  <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-white w-12 h-12 rounded-[1.25rem] flex flex-col items-center justify-center shadow-lg">
                        <span className="text-[8px] font-black uppercase leading-none opacity-60">{new Date(report.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}</span>
                        <span className="text-xl font-black leading-none">{new Date(report.date + 'T12:00:00').getDate()}</span>
                      </div>
                      <div>
                        <p className="font-black text-primary text-xs uppercase leading-tight tracking-wider">{report.cellName}</p>
                        <p className="text-[9px] text-secondary font-black uppercase mt-0.5">{getDayOfWeek(report.date)}</p>
                      </div>
                    </div>
                    <button onClick={() => handleEditReport(report)} className="p-2.5 text-secondary hover:bg-secondary/5 rounded-xl transition-all"><Pencil size={16} /></button>
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

                    {/* Detalhes dos Visitantes de 1ª Vez */}
                    {report.firstTimeVisitorsList && report.firstTimeVisitorsList.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1">
                          <Sparkles size={12} /> Visitantes de 1ª Vez Cadastrados
                        </p>
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
                                    {v.hasAttendedEncounter ? 'Fez Encontro' : 'Não Fez Encontro'}
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

      {activeTab === 'compartilhamentos' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <h3 className="text-2xl font-black text-primary uppercase tracking-tighter px-2">Materiais Compartilhados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shares.length === 0 ? (
              <div className="col-span-full bg-white p-20 rounded-[2rem] text-center border-2 border-dashed border-gray-100">
                <Share2 className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Nenhum material compartilhado ainda</p>
              </div>
            ) : (
              shares.map(share => (
                <div key={share.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
                  <div>
                    <h4 className="font-black text-primary uppercase leading-tight mb-2">{share.title}</h4>
                    <p className="text-xs text-gray-500 font-medium mb-4">{share.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-black text-gray-300 uppercase">{new Date(share.date).toLocaleDateString()}</span>
                    <a href={share.fileUrl} target="_blank" rel="noreferrer" className="text-secondary font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:underline">
                      <Download size={14} /> Baixar
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'eventos' && (() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const filteredEvents = events.filter(e => e.cellType === 'Todas' || e.cellType === cell.type);
        const upcomingEvents = filteredEvents.filter(e => e.date >= todayStr);
        const pastEvents = filteredEvents.filter(e => e.date < todayStr).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
          <div className="space-y-12 max-w-4xl mx-auto">
            {/* Próximos Eventos */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-primary uppercase tracking-tighter px-2 flex items-center gap-3">
                <Calendar className="text-secondary" size={28} /> Próximos Eventos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.length === 0 ? (
                  <div className="col-span-full bg-white p-20 rounded-[2rem] text-center border-2 border-dashed border-gray-100">
                    <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Nenhum evento agendado para sua célula</p>
                  </div>
                ) : (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{new Date(event.date + 'T12:00:00').toLocaleDateString()}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${event.cellType === 'Todas' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>{event.cellType}</span>
                        </div>
                        <h4 className="text-xl font-black text-primary uppercase leading-tight mb-3 group-hover:text-secondary transition-colors">{event.title}</h4>
                        <p className="text-xs text-gray-500 font-medium mb-6 line-clamp-3">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary mt-auto">
                        <MapPin size={16} className="text-secondary" /> {event.location || 'Local a definir'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Eventos Realizados */}
            {pastEvents.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter px-2 flex items-center gap-3">
                  <CheckCircle2 className="text-amber-500" size={24} /> Eventos Realizados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastEvents.map(event => (
                    <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden group grayscale opacity-70">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{new Date(event.date + 'T12:00:00').toLocaleDateString()}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full bg-gray-50 text-gray-400`}>{event.cellType}</span>
                        </div>
                        <h4 className="text-lg font-black text-gray-400 uppercase leading-tight mb-3">{event.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mt-auto">
                        <CheckCircle2 size={16} className="text-amber-500" /> Evento concluído em {new Date(event.date + 'T12:00:00').toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default LeaderDashboard;
