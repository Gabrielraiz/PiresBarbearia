import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';
import api from '../api';

const statusConfig = {
  confirmed: { label: 'Confirmado', className: 'badge-success', icon: Icons.Check },
  pending: { label: 'Pendente', className: 'badge-warning', icon: Icons.Clock },
  cancelled: { label: 'Cancelado', className: 'badge-danger', icon: Icons.X },
  completed: { label: 'Concluído', className: 'badge-info', icon: Icons.Check },
};

export default function MyAppointments() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const lang = settings.language === 'en';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadAppointments();
  }, [user]);

  const loadAppointments = () => {
    setLoading(true);
    api.get('/appointments/my').then(r => setAppointments(r.data)).finally(() => setLoading(false));
  };

  const handleCancel = async (id) => {
    if (!confirm(lang ? 'Cancel this booking?' : 'Cancelar este agendamento?')) return;
    await api.put(`/appointments/${id}/cancel`);
    loadAppointments();
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.date >= today && a.status !== 'cancelled');
  const past = appointments.filter(a => a.date < today || a.status === 'cancelled' || a.status === 'completed');

  const displayedAppts = filter === 'upcoming' ? upcoming : past;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white mb-1">{lang ? 'MY BOOKINGS' : 'MEUS AGENDAMENTOS'}</h1>
        <p className="text-[#a0a0a0] text-sm">{lang ? 'Manage your appointments' : 'Gerencie seus agendamentos'}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['upcoming', 'past'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-[#f5b800] text-black' : 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a] hover:border-[rgba(245,184,0,0.3)]'}`}>
            {f === 'upcoming' ? (lang ? 'Upcoming' : 'Próximos') : (lang ? 'Past' : 'Passados')}
            <span className="ml-2 text-xs opacity-70">
              {f === 'upcoming' ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 loading-shimmer rounded-xl" />)}
        </div>
      ) : displayedAppts.length === 0 ? (
        <div className="card p-12 text-center">
          <Icons.Calendar size={40} className="text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#a0a0a0]">{lang ? 'No bookings found' : 'Nenhum agendamento encontrado'}</p>
          {filter === 'upcoming' && (
            <button onClick={() => navigate('/booking')} className="btn-gold mt-4 px-6 py-2 text-sm">
              {lang ? 'BOOK NOW' : 'AGENDAR AGORA'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedAppts.map(appt => {
            const status = statusConfig[appt.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isUpcoming = appt.date >= today && appt.status !== 'cancelled' && appt.status !== 'completed';

            return (
              <div key={appt.id} className="card p-4 hover:border-[rgba(245,184,0,0.2)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display font-bold text-white text-lg">{appt.service_name}</span>
                      <span className={`badge ${status.className}`}>
                        <StatusIcon size={10} className="mr-1" />
                        {status.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-[#a0a0a0]">
                      <div className="flex items-center gap-1">
                        <Icons.User size={14} className="text-[#f5b800]" />
                        {appt.barber_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.Calendar size={14} className="text-[#f5b800]" />
                        {appt.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.Clock size={14} className="text-[#f5b800]" />
                        {appt.time}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-[#f5b800]">
                        R$ {parseFloat(appt.service_price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {isUpcoming && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setRescheduleModal(appt)}
                        className="px-3 py-1.5 text-xs border border-[#2a2a2a] rounded-lg text-[#a0a0a0] hover:border-[#f5b800] hover:text-[#f5b800] transition-all">
                        {lang ? 'Reschedule' : 'Remarcar'}
                      </button>
                      <button onClick={() => handleCancel(appt.id)}
                        className="px-3 py-1.5 text-xs border border-[rgba(239,68,68,0.3)] rounded-lg text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-all">
                        {lang ? 'Cancel' : 'Cancelar'}
                      </button>
                    </div>
                  )}

                  {appt.status === 'completed' && (
                    <button onClick={() => setReviewModal(appt)}
                      className="px-3 py-1.5 text-xs btn-outline flex-shrink-0">
                      {lang ? 'Review' : 'Avaliar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rescheduleModal && (
        <RescheduleModal
          appointment={rescheduleModal}
          onClose={() => setRescheduleModal(null)}
          onSuccess={() => { setRescheduleModal(null); loadAppointments(); }}
          lang={lang}
        />
      )}

      {reviewModal && (
        <ReviewModal
          appointment={reviewModal}
          onClose={() => setReviewModal(null)}
          onSuccess={() => { setReviewModal(null); loadAppointments(); }}
          lang={lang}
        />
      )}
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onSuccess, lang }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!date) return;
    api.get(`/barbers/${appointment.barber_id}/available-slots?date=${date}&service_id=${appointment.service_id}`)
      .then(r => { setSlots(r.data); setTime(''); }).catch(() => {});
  }, [date]);

  const handleSubmit = async () => {
    if (!date || !time) return;
    await api.put(`/appointments/${appointment.id}/reschedule`, { date, time });
    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-white text-xl mb-4">{lang ? 'RESCHEDULE' : 'REMARCAR'}</h3>
        <p className="text-[#a0a0a0] text-sm mb-4">{appointment.service_name} com {appointment.barber_name}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">{lang ? 'NEW DATE' : 'NOVA DATA'}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-dark" />
          </div>
          {slots.length > 0 && (
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'NEW TIME' : 'NOVO HORÁRIO'}</label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(t => (
                  <button key={t} onClick={() => setTime(t)}
                    className={`time-slot ${time === t ? 'selected' : ''}`}>{t}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">{lang ? 'Cancel' : 'Cancelar'}</button>
            <button onClick={handleSubmit} disabled={!date || !time} className="btn-gold flex-1 py-2.5 text-sm">
              {lang ? 'CONFIRM' : 'CONFIRMAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ appointment, onClose, onSuccess, lang }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    await api.post('/reviews', {
      service_id: appointment.service_id,
      barber_id: appointment.barber_id,
      appointment_id: appointment.id,
      rating,
      comment
    });
    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-white text-xl mb-2">{lang ? 'RATE YOUR SERVICE' : 'AVALIE SEU SERVIÇO'}</h3>
        <p className="text-[#a0a0a0] text-sm mb-4">{appointment.service_name}</p>
        <div className="flex gap-2 mb-4 star-rating">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setRating(s)} className="star">
              <Icons.Star size={28} className={s <= rating ? 'text-[#f5b800]' : 'text-[#2a2a2a]'} filled={s <= rating} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          className="input-dark h-24 resize-none mb-4"
          placeholder={lang ? 'Tell us about your experience...' : 'Conte sua experiência...'} />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">{lang ? 'Cancel' : 'Cancelar'}</button>
          <button onClick={handleSubmit} className="btn-gold flex-1 py-2.5 text-sm">{lang ? 'SEND' : 'ENVIAR'}</button>
        </div>
      </div>
    </div>
  );
}
