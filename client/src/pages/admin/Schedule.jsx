import React, { useEffect, useState } from 'react';
import { Icons } from '../../components/Icons';
import BookingCalendar from '../../components/BookingCalendar';
import api from '../../api';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function AdminSchedule() {
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

  const statusConfig = {
    confirmed: { label: 'Confirmado', className: 'badge-success' },
    pending: { label: 'Pendente', className: 'badge-warning' },
    cancelled: { label: 'Cancelado', className: 'badge-danger' },
    completed: { label: 'Concluído', className: 'badge-info' },
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">AGENDA</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4">
          <BookingCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">BARBEIRO</label>
              <select value={barberFilter} onChange={e => setBarberFilter(e.target.value)} className="input-dark text-sm">
                <option value="">Todos</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">STATUS</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark text-sm">
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title text-white">
              {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Todos'}
            </h2>
            <span className="badge badge-warning">{appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}</span>
          </div>

          {appointments.length === 0 ? (
            <div className="card p-12 text-center">
              <Icons.Calendar size={32} className="text-[#2a2a2a] mx-auto mb-2" />
              <p className="text-[#a0a0a0]">Nenhum agendamento para esta data</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map(appt => {
                const sc = statusConfig[appt.status] || statusConfig.pending;
                return (
                  <div key={appt.id} className="card p-4 hover:border-[rgba(245,184,0,0.2)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-center flex-shrink-0 w-12">
                          <p className="font-display font-bold text-[#f5b800] text-lg leading-none">{appt.time}</p>
                          <p className="text-[#a0a0a0] text-xs">{appt.service_duration}min</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{appt.client_name}</p>
                          <p className="text-[#a0a0a0] text-xs">{appt.service_name} • {appt.barber_name}</p>
                          <p className="text-[#a0a0a0] text-xs">{appt.client_phone}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`badge ${sc.className}`}>{sc.label}</span>
                        <p className="text-[#f5b800] text-xs font-semibold">R$ {parseFloat(appt.service_price).toFixed(2)}</p>
                        <div className="flex gap-1">
                          {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                            <>
                              <button onClick={() => handleStatus(appt.id, 'completed')}
                                className="px-2 py-1 text-xs rounded bg-[rgba(34,197,94,0.1)] text-green-400 border border-[rgba(34,197,94,0.3)] hover:bg-[rgba(34,197,94,0.2)]">
                                Concluir
                              </button>
                              <button onClick={() => handleStatus(appt.id, 'cancelled')}
                                className="px-2 py-1 text-xs rounded bg-[rgba(239,68,68,0.1)] text-red-400 border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.2)]">
                                Cancelar
                              </button>
                            </>
                          )}
                          {appt.status === 'pending' && (
                            <button onClick={() => handleStatus(appt.id, 'confirmed')}
                              className="px-2 py-1 text-xs rounded bg-[rgba(245,184,0,0.1)] text-[#f5b800] border border-[rgba(245,184,0,0.3)] hover:bg-[rgba(245,184,0,0.2)]">
                              Confirmar
                            </button>
                          )}
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

      <div className="mt-6 card p-5">
        <h3 className="section-title text-white mb-4">HORÁRIOS DE FUNCIONAMENTO</h3>
        <BusinessHours hours={businessHours} onUpdate={setBusinessHours} />
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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {localHours.map((h, i) => (
          <div key={h.day_of_week} className={`p-3 rounded-lg border ${h.is_closed ? 'border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)]' : 'border-[#2a2a2a] bg-[#1a1a1a]'}`}>
            <p className="text-xs text-[#a0a0a0] mb-2">{dayNames[h.day_of_week]}</p>
            {editing ? (
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                  <input type="checkbox" checked={!h.is_closed}
                    onChange={e => { const n = [...localHours]; n[i] = { ...h, is_closed: !e.target.checked }; setLocalHours(n); }}
                    className="accent-[#f5b800]" />
                  Aberto
                </label>
                {!h.is_closed && (
                  <div className="flex gap-1 items-center text-xs">
                    <input type="time" value={h.open_time} onChange={e => { const n = [...localHours]; n[i] = { ...h, open_time: e.target.value }; setLocalHours(n); }}
                      className="bg-[#0d0d0d] border border-[#2a2a2a] rounded px-1 py-0.5 text-white text-xs flex-1" />
                    <span className="text-[#a0a0a0]">-</span>
                    <input type="time" value={h.close_time} onChange={e => { const n = [...localHours]; n[i] = { ...h, close_time: e.target.value }; setLocalHours(n); }}
                      className="bg-[#0d0d0d] border border-[#2a2a2a] rounded px-1 py-0.5 text-white text-xs flex-1" />
                  </div>
                )}
              </div>
            ) : (
              <p className={`text-sm font-semibold ${h.is_closed ? 'text-red-400' : 'text-white'}`}>
                {h.is_closed ? 'Fechado' : `${h.open_time} - ${h.close_time}`}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {editing ? (
          <>
            <button onClick={handleSave} className="btn-gold px-4 py-2 text-sm">Salvar</button>
            <button onClick={() => { setEditing(false); setLocalHours(hours); }} className="btn-outline px-4 py-2 text-sm">Cancelar</button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-outline px-4 py-2 text-sm">
            <span className="flex items-center gap-2"><Icons.Edit size={14} /> Editar Horários</span>
          </button>
        )}
      </div>
    </div>
  );
}
