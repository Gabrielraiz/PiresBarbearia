import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Icons from '../components/Icons';
import api from '../api';

const statusConfig = {
  confirmed: { label: 'Confirmado', className: 'badge-success', icon: Icons.Check },
  pending: { label: 'Pendente', className: 'badge-warning', icon: Icons.Clock },
  cancelled: { label: 'Cancelado', className: 'badge-danger', icon: Icons.X },
  completed: { label: 'Concluído', className: 'badge-info', icon: Icons.Check },
};

export default function MyAppointments() {
  const { user } = useAuth();
  const { settings, t, labels } = useSettings();
  const navigate = useNavigate();

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
    const msg = t(
      'Cancelar este agendamento?', 
      'Cancel this booking?', 
      '¿Cancelar esta cita?', 
      'Annuler ce rendez-vous?', 
      'Diesen Termin absagen?', 
      'Annullare este appuntamento?'
    );
    if (!confirm(msg)) return;
    await api.put(`/appointments/${id}/cancel`);
    loadAppointments();
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.date >= today && a.status !== 'cancelled');
  const past = appointments.filter(a => a.date < today || a.status === 'cancelled' || a.status === 'completed');

  const displayedAppts = filter === 'upcoming' ? upcoming : past;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-screen bg-[var(--bg-main)]">
      <div className="mb-12 text-center md:text-left">
        <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4 uppercase italic">
          {t('MEUS', 'MY', 'MIS', 'MES', 'MEINE', 'MIEI')} <span className="text-[var(--gold)]">{labels.appointments.toUpperCase()}</span>
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
          <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
            {t(
              'GERENCIE SEUS HORÁRIOS E HISTÓRICO', 
              'MANAGE YOUR BOOKINGS AND HISTORY', 
              'GESTIONE SUS CITAS E HISTORIAL',
              'GÉREZ VOS RENDEZ-VOUS ET VOTRE HISTORIQUE',
              'VERWALTEN SIE IHRE TERMINE UND IHRE HISTORIE',
              'GESTISCI I TUOI APPUNTAMENTI E LA TUA STORIA'
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-10 p-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-fit mx-auto md:mx-0">
        {[
          { key: 'upcoming', label: t('Próximos', 'Upcoming', 'Próximos', 'À venir', 'Kommende', 'Prossimi'), count: upcoming.length, icon: <Icons.Clock size={16} /> },
          { key: 'past', label: t('Histórico', 'Past History', 'Historial', 'Historique', 'Verlauf', 'Storia'), count: past.length, icon: <Icons.History size={16} /> },
        ].map(f => (
          <button 
            key={f.key} 
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
              filter === f.key 
                ? 'bg-[var(--gold)] text-black shadow-lg scale-105' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f.icon}
            {f.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[8px] ${filter === f.key ? 'bg-black/20' : 'bg-[var(--bg-main)]'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : displayedAppts.length === 0 ? (
        <div className="card p-20 text-center border-dashed border-[var(--border)] bg-[var(--bg-card)]/30 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
            <Icons.Calendar size={40} className="text-[var(--text-secondary)]/20" />
          </div>
          <h4 className="text-[var(--text-primary)] font-bold text-lg uppercase tracking-widest mb-4">
            {t('NENHUM REGISTRO ENCONTRADO', 'NO BOOKINGS FOUND', 'NO SE ENCONTRARON CITAS', 'AUCUN RENDEZ-VOUS TROUVÉ', 'KEINE TERMINE GEFUNDEN', 'NESSUN APPUNTAMENTO TROVATO')}
          </h4>
          {filter === 'upcoming' && (
            <button 
              onClick={() => navigate('/booking')} 
              className="px-10 py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95"
            >
              {t('AGENDAR AGORA', 'BOOK NOW', 'RESERVAR AHORA', 'RÉSERVER MAINTENANT', 'JETZT BUCHEN', 'PRENOTA ORA')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {displayedAppts.map(appt => {
            const status = statusConfig[appt.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isUpcoming = appt.date >= today && appt.status !== 'cancelled' && appt.status !== 'completed';

            return (
              <div key={appt.id} className="group card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-8 hover:border-[var(--gold)]/50 bg-[var(--bg-card)] border-[var(--border)] transition-all duration-500 shadow-xl">
                {/* Date & Time Column */}
                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-1 w-full md:w-32 py-4 md:py-6 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-colors shrink-0">
                  <p className="font-display font-black text-[var(--gold)] text-3xl leading-none italic">{appt.time}</p>
                  <div className="h-4 w-[1px] bg-[var(--border)] md:hidden" />
                  <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-widest uppercase">
                    {new Date(appt.date + 'T12:00:00').toLocaleDateString(settings.language === 'pt' ? 'pt-BR' : settings.language, { day: '2-digit', month: 'short' })}
                  </p>
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display font-black text-[var(--text-primary)] text-2xl uppercase italic tracking-tighter group-hover:text-[var(--gold)] transition-colors">
                      {appt.service_name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border flex items-center gap-2 ${
                      appt.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      appt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      <StatusIcon size={10} />
                      {t(status.label, status.label, status.label).toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 text-[var(--text-secondary)] text-xs font-medium italic">
                      <div className="p-2 rounded-lg bg-[var(--bg-main)] text-[var(--gold)]">
                        <Icons.User size={14} />
                      </div>
                      {appt.barber_name}
                    </div>
                    <div className="flex items-center gap-3 text-[var(--text-secondary)] text-xs font-medium italic">
                      <div className="p-2 rounded-lg bg-[var(--bg-main)] text-[var(--gold)]">
                        <Icons.Clock size={14} />
                      </div>
                      {appt.service_duration} {t('MINUTOS', 'MINUTES', 'MINUTOS', 'MINUTES', 'MINUTEN', 'MINUTI')}
                    </div>
                    <div className="flex items-center gap-3 text-[var(--gold)] text-sm font-black italic">
                      <div className="p-2 rounded-lg bg-[var(--bg-main)]">
                        <Icons.Zap size={14} />
                      </div>
                      R$ {parseFloat(appt.service_price).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="w-full md:w-auto flex flex-col gap-3 pt-6 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
                  {isUpcoming && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setRescheduleModal(appt)}
                        className="flex-1 px-6 py-3 text-[10px] font-black tracking-widest uppercase border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all bg-[var(--bg-main)]"
                      >
                        {t('REMARCAR', 'RESCHEDULE', 'REPROGRAMAR', 'REPROGRAMMER', 'UMBUCHEN', 'RIPROGRAMMARE')}
                      </button>
                      <button 
                        onClick={() => handleCancel(appt.id)}
                        className="flex-1 px-6 py-3 text-[10px] font-black tracking-widest uppercase border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500/10 transition-all bg-[var(--bg-main)]"
                      >
                        {t('CANCELAR', 'CANCEL', 'CANCELAR', 'ANNULER', 'STORNIEREN', 'ANNULLARE')}
                      </button>
                    </div>
                  )}

                  {appt.status === 'completed' && (
                    <button 
                      onClick={() => setReviewModal(appt)}
                      className="w-full px-8 py-4 bg-[var(--gold)] text-black font-black text-[10px] tracking-widest uppercase rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Icons.Star size={16} />
                      {t('AVALIAR EXPERIÊNCIA', 'RATE EXPERIENCE', 'VALORAR EXPERIENCIA', 'ÉVALUER L\'EXPÉRIENCE', 'ERFAHRUNG BEWERTEN', 'VALUTA L\'ESPERIENZA')}
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
          t={t}
        />
      )}

      {reviewModal && (
        <ReviewModal
          appointment={reviewModal}
          onClose={() => setReviewModal(null)}
          onSuccess={() => { setReviewModal(null); loadAppointments(); }}
          t={t}
        />
      )}
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onSuccess, t }) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-1">{t('REAGENDAMENTO', 'RESCHEDULING', 'REPROGRAMACIÓN', 'REPROGRAMMATION', 'UMBUCHUNG', 'RIPROGRAMMAZIONE')}</p>
            <h3 className="font-display font-black text-3xl text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">
              {t('NOVO', 'NEW', 'NUEVO', 'NOUVEAU', 'NEU', 'NUOVO')} <span className="text-[var(--gold)]">{t('HORÁRIO', 'TIME', 'HORARIO', 'HORAIRE', 'ZEIT', 'ORARIO')}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
            <div className="p-3 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
              <Icons.Scissors size={20} />
            </div>
            <div>
              <p className="text-[var(--text-primary)] font-bold text-sm uppercase tracking-tight italic">{appointment.service_name}</p>
              <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-widest uppercase mt-1">{t('COM', 'WITH', 'CON', 'AVEC', 'MIT', 'CON')} {appointment.barber_name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
              <Icons.Calendar size={14} className="text-[var(--gold)]" /> {t('SELECIONE A DATA', 'SELECT DATE', 'SELECCIONE FECHA', 'CHOISIR DATE', 'DATUM WÄHLEN', 'SCEGLI DATA')}
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-bold" 
            />
          </div>

          {slots.length > 0 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
                <Icons.Clock size={14} className="text-[var(--gold)]" /> {t('HORÁRIOS DISPONÍVEIS', 'AVAILABLE TIMES', 'HORARIOS DISPONIBLES', 'HORAIRES DISPONIBLES', 'VERFÜGBARE ZEITEN', 'ORARI DISPONIBILI')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTime(t)}
                    className={`py-3 rounded-xl border text-[10px] font-black tracking-widest transition-all ${
                      time === t 
                        ? 'bg-[var(--gold)] border-[var(--gold)] text-black shadow-lg shadow-[var(--gold)]/20 scale-105' 
                        : 'bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--gold)]/30'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              {t('DESCARTAR', 'DISCARD', 'DESCARTAR', 'ANNULER', 'VERWERFEN', 'ANNULLA')}
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={!date || !time} 
              className="flex-[2] py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95 disabled:opacity-50"
            >
              {t('CONFIRMAR', 'CONFIRM', 'CONFIRMAR', 'CONFIRMER', 'BESTÄTIGEN', 'CONFERMA')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ appointment, onClose, onSuccess, t }) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-1">FEEDBACK</p>
            <h3 className="font-display font-black text-3xl text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">
              {t('SUA', 'YOUR', 'SU', 'VOTRE', 'IHRE', 'LA TUA')} <span className="text-[var(--gold)]">{t('EXPERIÊNCIA', 'EXPERIENCE', 'EXPERIENCIA', 'EXPÉRIENCE', 'ERFAHRUNG', 'ESPERIENZA')}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center">
            <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.4em] uppercase mb-6 italic">
              {t('SUA OPINIÃO É FUNDAMENTAL', 'YOUR OPINION IS ESSENTIAL', 'SU OPINIÓN ES FUNDAMENTAL', 'VOTRE AVIS EST ESSENTIEL', 'IHRE MEINUNG IST WICHTIG', 'LA TUA OPINIONE È ESSENZIALE')}
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)}
                  className={`group relative transition-all duration-300 ${s <= rating ? 'scale-110' : 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                  <Icons.Star 
                    size={42} 
                    className={s <= rating ? 'text-[var(--gold)]' : 'text-[var(--text-secondary)]'} 
                    fill={s <= rating ? 'currentColor' : 'none'} 
                  />
                  {s <= rating && (
                    <div className="absolute inset-0 bg-[var(--gold)] blur-[20px] opacity-20" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
              <Icons.MessageSquare size={14} className="text-[var(--gold)]" /> {t('COMENTÁRIOS (OPCIONAL)', 'COMMENTS (OPTIONAL)', 'COMENTARIOS (OPCIONAL)', 'COMMENTAIRES (OPTIONNEL)', 'KOMMENTARE (OPTIONAL)', 'COMMENTI (OPZIONALE)')}
            </label>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-3xl px-6 py-6 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none h-32 resize-none italic font-medium" 
              placeholder={t(
                'Como foi seu corte? Conte-nos mais...', 
                'How was your haircut? Tell us more...', 
                '¿Cómo fue tu corte? Cuéntanos más...',
                'Comment s\'est passé votre coupe? Dites-nous en plus...',
                'Wie war dein Haarschnitt? Erzähl uns mehr...',
                'Com\'era il tuo taglio? Dicci di più...'
              )} 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              {t('FECHAR', 'CLOSE', 'CERRAR', 'FERMER', 'SCHLIESSEN', 'CHIUDI')}
            </button>
            <button 
              onClick={handleSubmit} 
              className="flex-[2] py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95"
            >
              {t('ENVIAR AVALIAÇÃO', 'SEND REVIEW', 'ENVIAR VALORACIÓN', 'ENVOYER L\'AVIS', 'BEWERTUNG SENDEN', 'INVIA VALUTAZIONE')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
