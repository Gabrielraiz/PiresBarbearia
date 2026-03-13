import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import BookingCalendar from '../../components/BookingCalendar';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function AdminSchedule() {
  const { t, labels } = useSettings();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [barbers, setBarbers] = useState([]);
  const [barberFilter, setBarberFilter] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);

  useEffect(() => {
    api.get('/barbers').then(r => setBarbers(r.data));
    api.get('/settings/business-hours').then(r => setBusinessHours(r.data));
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, statusFilter, barberFilter]);

  const loadAppointments = () => {
    let url = `/appointments/admin/all?date=${selectedDate}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (barberFilter) url += `&barber_id=${barberFilter}`;
    api.get(url).then(r => setAppointments(r.data));
  };

  const handleStatus = async (id, status) => {
    await api.put(`/appointments/${id}/status`, { status });
    loadAppointments();
  };

  const handleDelete = async (id) => {
    if (!confirm('EXCLUIR PERMANENTEMENTE este agendamento? Esta ação removerá o registro do banco de dados.')) return;
    try {
      await api.delete(`/appointments/${id}`);
      loadAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const statusConfig = {
    confirmed: { label: t('Confirmado', 'Confirmed'), className: 'badge-success' },
    pending: { label: t('Pendente', 'Pending'), className: 'badge-warning' },
    cancelled: { label: t('Cancelado', 'Cancelled'), className: 'badge-danger' },
    completed: { label: t('Concluído', 'Completed'), className: 'badge-info' },
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
          AGENDA <span className="text-[var(--gold)]">GERENCIAL</span>
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
          <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
            {t('CONTROLE DE AGENDAMENTOS E HORÁRIOS', 'BOOKING AND SCHEDULE CONTROL')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="xl:col-span-4 space-y-6">
          <div className="card p-6 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)]">
                <Icons.Calendar size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight uppercase">SELECIONAR DATA</h3>
            </div>
            
            <BookingCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
            
            <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.User size={14} /> {t(`FILTRAR POR ${labels.professional}`.toUpperCase(), `FILTER BY ${labels.professional}`.toUpperCase())}
                </label>
                <select 
                  value={barberFilter} 
                  onChange={e => setBarberFilter(e.target.value)} 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none appearance-none cursor-pointer shadow-inner"
                >
                  <option value="">{t('Todos os profissionais', 'All professionals')}</option>
                  {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.Filter size={14} /> {t('STATUS DO AGENDAMENTO', 'BOOKING STATUS')}
                </label>
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)} 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none appearance-none cursor-pointer shadow-inner"
                >
                  <option value="">{t('Todos os status', 'All statuses')}</option>
                  <option value="pending">{t('Pendentes', 'Pending')}</option>
                  <option value="confirmed">{t('Confirmados', 'Confirmed')}</option>
                  <option value="completed">{t('Concluídos', 'Completed')}</option>
                  <option value="cancelled">{t('Cancelados', 'Cancelled')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-6 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] border-none shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black/60 font-black text-[10px] tracking-widest uppercase mb-1">{t('Total para hoje', 'Today total')}</p>
                <h4 className="text-black font-display font-black text-3xl leading-none">{appointments.length}</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Icons.TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[var(--gold)] rounded-full" />
              <h2 className="font-display font-black text-2xl text-[var(--text-primary)] tracking-tight uppercase">
                {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : t('Todos', 'All')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] font-black tracking-widest uppercase">
                {appointments.length} {t('REGISTRO', 'RECORD')}{appointments.length !== 1 ? 'S' : ''}
              </span>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="card p-20 text-center border-dashed border-[var(--border)] bg-[var(--bg-card)]/30">
              <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
                <Icons.Calendar size={40} className="text-[var(--text-secondary)]/20" />
              </div>
              <h4 className="text-[var(--text-primary)] font-bold text-lg uppercase tracking-widest">{t('NENHUM AGENDAMENTO', 'NO BOOKINGS')}</h4>
              <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto mt-2 italic">
                {t('Não há serviços marcados para os filtros selecionados nesta data.', 'No bookings for the selected filters on this date.')}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              {appointments.map(appt => {
                const sc = statusConfig[appt.status] || statusConfig.pending;
                return (
                  <div key={appt.id} className="card p-5 group hover:border-[var(--gold)]/50 transition-all duration-500 bg-[var(--bg-card)] shadow-lg hover:shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        {/* Time Column */}
                        <div className="text-center flex-shrink-0 w-20 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-colors">
                          <p className="font-display font-black text-[var(--gold)] text-2xl leading-none mb-1">{appt.time}</p>
                          <p className="text-[var(--text-secondary)] text-[10px] font-bold tracking-tighter">{appt.service_duration} MIN</p>
                        </div>
                        
                        {/* Client Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[var(--text-primary)] font-bold text-xl tracking-tight truncate group-hover:text-[var(--gold)] transition-colors">
                              {appt.client_name}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${
                              appt.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                              appt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                              appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                              'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            }`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-[var(--text-secondary)] text-sm font-medium mb-1 flex items-center gap-2">
                            <span className="text-[var(--gold)] font-bold">{appt.service_name}</span> 
                            <span className="text-[var(--border)]">•</span> 
                            {appt.barber_name}
                          </p>
                          <p className="text-[var(--text-secondary)]/60 text-xs font-mono tracking-tighter flex items-center gap-2">
                            <Icons.Phone size={10} /> {appt.client_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 flex-shrink-0 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                        <p className="text-[var(--gold)] text-2xl font-black tracking-tighter">
                          <span className="text-[10px] mr-1 opacity-50">R$</span>{parseFloat(appt.service_price).toFixed(2)}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleStatus(appt.id, 'completed')}
                                className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                              >
                                CONCLUIR
                              </button>
                              <button 
                                onClick={() => handleStatus(appt.id, 'cancelled')}
                                className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                              >
                                CANCELAR
                              </button>
                            </div>
                          )}
                          {appt.status === 'pending' && (
                            <button 
                              onClick={() => handleStatus(appt.id, 'confirmed')}
                              className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-xl bg-[var(--gold)] text-black font-black hover:bg-white transition-all shadow-lg shadow-[var(--gold)]/20"
                            >
                              CONFIRMAR
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(appt.id)} 
                            className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center"
                            title="Excluir Registro"
                          >
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Business Hours Section */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-1 bg-[var(--gold)] rounded-full" />
          <h2 className="font-display font-black text-2xl text-[var(--text-primary)] tracking-tight uppercase">HORÁRIOS DE FUNCIONAMENTO</h2>
        </div>
        <div className="card p-8 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl">
          <BusinessHours hours={businessHours} onUpdate={setBusinessHours} />
        </div>
      </div>
    </div>
  );
}

function BusinessHours({ hours, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [localHours, setLocalHours] = useState(hours);
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => setLocalHours(hours), [hours]);

  const handleSave = async () => {
    await api.put('/settings/business-hours', { hours: localHours });
    onUpdate(localHours);
    setEditing(false);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {localHours.map((h, i) => (
          <div 
            key={h.day_of_week} 
            className={`p-5 rounded-2xl border transition-all duration-300 ${
              h.is_closed 
                ? 'border-red-500/20 bg-red-500/[0.02] opacity-60' 
                : 'border-[var(--border)] bg-[var(--bg-main)] hover:border-[var(--gold)]/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)]">
                {dayNames[h.day_of_week]}
              </p>
              {!h.is_closed && !editing && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={!h.is_closed}
                      onChange={e => { const n = [...localHours]; n[i] = { ...h, is_closed: !e.target.checked }; setLocalHours(n); }}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--gold)] transition-colors" />
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">
                    {!h.is_closed ? 'ABERTO' : 'FECHADO'}
                  </span>
                </label>

                {!h.is_closed && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">ENTRADA</span>
                      <input 
                        type="time" 
                        value={h.open_time} 
                        onChange={e => { const n = [...localHours]; n[i] = { ...h, open_time: e.target.value }; setLocalHours(n); }}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[var(--gold)] transition-colors" 
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">SAÍDA</span>
                      <input 
                        type="time" 
                        value={h.close_time} 
                        onChange={e => { const n = [...localHours]; n[i] = { ...h, close_time: e.target.value }; setLocalHours(n); }}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[var(--gold)] transition-colors" 
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icons.Clock size={14} className={h.is_closed ? 'text-red-500/50' : 'text-[var(--gold)]'} />
                <p className={`text-lg font-display font-black tracking-tight ${h.is_closed ? 'text-red-500/50' : 'text-[var(--text-primary)]'}`}>
                  {h.is_closed ? 'FECHADO' : `${h.open_time} — ${h.close_time}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center md:justify-start">
        {editing ? (
          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              className="px-8 py-3 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20"
            >
              SALVAR ALTERAÇÕES
            </button>
            <button 
              onClick={() => { setEditing(false); setLocalHours(hours); }} 
              className="px-8 py-3 bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border)] font-black text-xs tracking-[0.2em] uppercase rounded-xl hover:text-white transition-all"
            >
              CANCELAR
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setEditing(true)} 
            className="group flex items-center gap-3 px-8 py-4 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:border-[var(--gold)] transition-all shadow-xl"
          >
            <Icons.Edit size={16} className="text-[var(--gold)] group-hover:scale-110 transition-transform" />
            EDITAR EXPEDIENTE
          </button>
        )}
      </div>
    </div>
  );
}
