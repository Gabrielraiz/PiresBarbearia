import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminReports() {
  const { t, labels } = useSettings();
  const [data, setData] = useState(null);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get(`/admin/reports?from=${from}&to=${to}`).then(r => setData(r.data));
  }, [from, to]);

  const handleBackup = async () => {
    try {
      const response = await api.get('/admin/backup/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `backup-piresqk-${new Date().toISOString().split('T')[0]}.db`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Backup failed:", error);
      alert(t('Falha ao gerar o backup. Verifique o console para mais detalhes.', 'Backup generation failed. Check console for details.'));
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
            INTELIGÊNCIA DE <span className="text-[var(--gold)]">DADOS</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
            <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase italic">
              {t('ANÁLISE DE PERFORMANCE E MÉTRICAS', 'PERFORMANCE AND METRICS ANALYSIS')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)] shadow-xl">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase ml-1 italic">PERÍODO INICIAL</label>
            <input 
              type="date" 
              value={from} 
              onChange={e => setFrom(e.target.value)} 
              className="bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[var(--gold)] transition-colors" 
            />
          </div>
          <div className="h-8 w-[1px] bg-[var(--border)] hidden md:block" />
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase ml-1 italic">PERÍODO FINAL</label>
            <input 
              type="date" 
              value={to} 
              onChange={e => setTo(e.target.value)} 
              className="bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[var(--gold)] transition-colors" 
            />
          </div>
          <button 
            onClick={handleBackup} 
            className="group flex items-center gap-3 px-6 py-3 bg-[var(--gold)] text-black font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-white transition-all shadow-lg active:scale-95 ml-auto"
          >
            <Icons.Download size={16} className="group-hover:scale-110 transition-transform" /> {t('BACKUP DB', 'BACKUP DB')}
          </button>
        </div>
      </div>

      {data ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: t(`Total ${labels.appointments}`, `Total ${labels.appointments}`), value: data.totalAppts, icon: Icons.Calendar, color: 'text-[var(--gold)]', bg: 'bg-[var(--gold)]/10' },
              { label: t(`${labels.services} Concluídos`, `${labels.services} Completed`), value: data.completedAppts, icon: Icons.CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
              { label: t('Receita Bruta', 'Gross Revenue'), value: `R$ ${parseFloat(data.revenue).toFixed(2)}`, icon: Icons.TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: t('Satisfação Média', 'Average Satisfaction'), value: `${parseFloat(data.avgRating).toFixed(1)} ★`, icon: Icons.Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="group card p-8 bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--gold)]/30 transition-all duration-500 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon size={80} />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic">{label}</p>
                  <div className={`p-2 rounded-xl ${bg} ${color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <p className={`font-display font-black text-4xl tracking-tighter ${color} leading-none italic`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Top Services */}
            <div className="xl:col-span-5 card p-8 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                  <Icons.Scissors size={20} />
                </div>
                <h3 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase italic">SERVIÇOS EM ALTA</h3>
              </div>
              
              {data.topServices.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Icons.Info size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">SEM DADOS NO PERÍODO</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.topServices.map((s, i) => {
                    const pct = (s.count / data.topServices[0].count * 100);
                    return (
                      <div key={s.name} className="group">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <span className="text-[10px] font-black text-[var(--gold)] mr-2">0{i + 1}</span>
                            <span className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight group-hover:text-[var(--gold)] transition-colors">{s.name}</span>
                          </div>
                          <span className="text-xs font-bold text-[var(--text-secondary)]">{s.count} agendamentos</span>
                        </div>
                        <div className="h-2 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border)]/50">
                          <div 
                            className="h-full bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold)] rounded-full transition-all duration-1000 delay-300" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Clients */}
            <div className="xl:col-span-7 card p-8 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                  <Icons.Users size={20} />
                </div>
                <h3 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase italic">CLIENTES FREQUENTES</h3>
              </div>
              
              {data.topClients.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Icons.Info size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">SEM DADOS NO PERÍODO</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.topClients.map((c, i) => (
                    <div key={c.name} className="group p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--gold)]/30 transition-all duration-500 flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)] font-black text-xl group-hover:scale-110 group-hover:border-[var(--gold)]/30 transition-all">
                        {c.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[var(--text-primary)] truncate uppercase tracking-tight group-hover:text-[var(--gold)] transition-colors">{c.name}</p>
                        <p className="text-[var(--text-secondary)] text-[10px] truncate italic">{c.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--gold)] font-black text-lg leading-none italic">{c.count}x</p>
                        <p className="text-[var(--text-secondary)]/40 text-[8px] font-black tracking-widest uppercase">VISITAS</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Trend */}
            {data.monthlyData.length > 0 && (
              <div className="xl:col-span-12 card p-8 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                      <Icons.BarChart size={20} />
                    </div>
                    <h3 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase italic">EVOLUÇÃO TEMPORAL</h3>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[var(--gold)] shadow-lg shadow-[var(--gold)]/20" />
                      <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">CONCLUÍDOS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[var(--gold)]/20" />
                      <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">TOTAL AGENDADO</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {data.monthlyData.map(m => {
                    const maxVal = Math.max(...data.monthlyData.map(x => x.appointments));
                    const totalPct = (m.appointments / maxVal * 100);
                    const completedPct = (m.completed / maxVal * 100);
                    return (
                      <div key={m.month} className="group">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="w-24 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic">{m.month}</span>
                          <div className="flex-1 h-8 bg-[var(--bg-main)] rounded-xl border border-[var(--border)]/50 relative overflow-hidden group-hover:border-[var(--gold)]/30 transition-all">
                            <div 
                              className="absolute inset-y-0 left-0 bg-[var(--gold)]/10 transition-all duration-1000 delay-300" 
                              style={{ width: `${totalPct}%` }} 
                            />
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold)] transition-all duration-1000 delay-500 shadow-[0_0_20px_rgba(245,184,0,0.3)]" 
                              style={{ width: `${completedPct}%` }} 
                            />
                            <div className="absolute inset-0 flex items-center justify-between px-4">
                              <span className="text-[10px] font-black text-[var(--text-primary)] mix-blend-difference">{m.completed} CONCLUÍDOS</span>
                              <span className="text-[10px] font-black text-[var(--text-secondary)]">{m.appointments} TOTAL</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <Icons.RefreshCw size={48} className="text-[var(--gold)] animate-spin mb-6" />
          <p className="text-[var(--text-secondary)] font-black tracking-[0.4em] uppercase text-xs">PROCESSANDO DADOS ANALÍTICOS...</p>
        </div>
      )}
    </div>
  );
}
