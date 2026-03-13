import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t, settings } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    confirmed: { label: t('Confirmado', 'Confirmed', 'Confirmado', 'Confirmé', 'Bestätigt', 'Confermato'), className: 'badge-success' },
    pending: { label: t('Pendente', 'Pending', 'Pendiente', 'En attente', 'Ausstehend', 'In attesa'), className: 'badge-warning' },
    cancelled: { label: t('Cancelado', 'Cancelled', 'Cancelado', 'Annulé', 'Abgebrochen', 'Annullato'), className: 'badge-danger' },
    completed: { label: t('Concluído', 'Completed', 'Completado', 'Terminé', 'Abgeschlossen', 'Completato'), className: 'badge-info' },
  };

  const stats = data ? [
    { label: t('Agendamentos Hoje', 'Bookings Today', 'Citas de Hoy', 'RDV Aujourd\'hui', 'Termine Heute', 'Appuntamenti Oggi'), value: data.todayAppts, icon: Icons.Calendar, color: 'text-[#f5b800]' },
    { label: t('Pendentes', 'Pending', 'Pendientes', 'En attente', 'Ausstehend', 'In attesa'), value: data.pendingAppts, icon: Icons.Clock, color: 'text-yellow-400' },
    { label: t('Total Clientes', 'Total Clients', 'Total Clientes', 'Total Clients', 'Gesamt Kunden', 'Totale Clienti'), value: data.totalClients, icon: Icons.Users, color: 'text-blue-400' },
    { label: t('Receita do Mês', 'Month Revenue', 'Ingresos del Mes', 'Revenu du Mois', 'Monatsumsatz', 'Entrate del Mese'), value: `${settings.language === 'pt' ? 'R$' : '$'} ${parseFloat(data.monthRevenue).toFixed(2)}`, icon: Icons.BarChart, color: 'text-green-400' },
  ] : [];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
            {t('PAINEL DE', 'CONTROL', 'PANEL DE', 'PANNEAU DE', 'KONTROLL', 'PANNELLO DI')} <span className="text-[var(--gold)]">{t('CONTROLE', 'PANEL', 'CONTROL', 'CONTROLE', 'ZENTRUM', 'CONTROLLO')}</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
            <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase italic">
              {new Date().toLocaleDateString(settings.language === 'pt' ? 'pt-BR' : settings.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border)] p-2 rounded-2xl shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
            <Icons.Shield size={24} />
          </div>
          <div className="pr-4">
            <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-widest uppercase">{t('STATUS DO SISTEMA', 'SYSTEM STATUS', 'ESTADO DEL SISTEMA', 'STATUT DU SYSTÈME', 'SYSTEMSTATUS', 'STATO DEL SISTEMA')}</p>
            <p className="text-green-500 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {t('ONLINE', 'ONLINE', 'EN LÍNEA', 'EN LIGNE', 'ONLINE', 'ONLINE')}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="group relative card p-8 bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">{label}</p>
                <div className={`p-2 rounded-lg bg-current/10 ${color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className={`font-display font-black text-4xl tracking-tighter ${color} leading-none`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Next Appointments */}
        <div className="xl:col-span-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-1 bg-[var(--gold)] rounded-full" />
            <h2 className="font-display font-black text-2xl text-[var(--text-primary)] tracking-tight uppercase">PRÓXIMOS AGENDAMENTOS</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl animate-pulse" />)}
            </div>
          ) : data?.recentAppts?.length === 0 ? (
            <div className="card p-20 text-center border-dashed border-[var(--border)] bg-[var(--bg-card)]/30">
              <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
                <Icons.Calendar size={40} className="text-[var(--text-secondary)]/20" />
              </div>
              <h4 className="text-[var(--text-primary)] font-bold text-lg uppercase tracking-widest">NENHUM AGENDAMENTO</h4>
              <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto mt-2 italic">A agenda está livre para os próximos horários.</p>
            </div>
          ) : (
            <div className="grid gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
              {data?.recentAppts?.map(appt => {
                const sc = statusConfig[appt.status] || statusConfig.pending;
                return (
                  <div key={appt.id} className="group card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-[var(--gold)]/50 bg-[var(--bg-card)] border-[var(--border)] transition-all duration-500 shadow-lg">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-14 h-14 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--gold)] font-black text-2xl border border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-all">
                        {appt.client_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-primary)] font-bold text-lg truncate tracking-tight group-hover:text-[var(--gold)] transition-colors">
                          {appt.client_name}
                        </p>
                        <p className="text-[var(--text-secondary)] text-xs font-medium italic">
                          {appt.service_name} <span className="text-[var(--border)] mx-1">•</span> {appt.barber_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                      <div className="text-right flex-1 sm:flex-initial">
                        <p className="text-[var(--gold)] font-display font-black text-2xl leading-none mb-1">{appt.time}</p>
                        <p className="text-[var(--text-secondary)]/40 text-[10px] font-black tracking-widest uppercase">{appt.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${
                        appt.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        appt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {sc.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              <button 
                onClick={() => navigate('/admin/schedule')}
                className="w-full py-4 text-[10px] font-black tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors uppercase italic"
              >
                VER AGENDA COMPLETA +
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-1 bg-[var(--gold)] rounded-full" />
            <h2 className="font-display font-black text-2xl text-[var(--text-primary)] tracking-tight uppercase">ACESSO RÁPIDO</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
            {[
              { icon: Icons.Calendar, label: 'Agenda', to: '/admin/schedule', desc: 'Gerenciar horários' },
              { icon: Icons.Users, label: 'Clientes', to: '/admin/clients', desc: 'Base de dados' },
              { icon: Icons.Scissors, label: 'Serviços', to: '/admin/services', desc: 'Menu de cortes' },
              { icon: Icons.User, label: 'Barbeiros', to: '/admin/barbers', desc: 'Time de elite' },
              { icon: Icons.Tag, label: 'Promoções', to: '/admin/promotions', desc: 'Ofertas ativas' },
              { icon: Icons.Image, label: 'Galeria', to: '/admin/media', desc: 'Portfólio 3D' },
              { icon: Icons.Settings, label: 'Ajustes', to: '/admin/settings', desc: 'Configurações' },
            ].map(({ icon: Icon, label, to, desc }) => (
              <button 
                key={to} 
                onClick={() => navigate(to)}
                className="group card p-6 flex flex-col items-center text-center gap-3 bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-lg hover:shadow-2xl active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)] group-hover:scale-110 group-hover:border-[var(--gold)]/30 transition-all duration-500">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-[var(--text-primary)] font-black text-xs tracking-widest uppercase mb-1">{label}</p>
                  <p className="text-[var(--text-secondary)]/40 text-[8px] font-bold uppercase tracking-tighter">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
