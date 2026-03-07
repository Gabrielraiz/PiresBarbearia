import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';
import BookingCalendar from '../components/BookingCalendar';
import api from '../api';

export default function Booking() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = settings.language === 'en';

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [holdTimer, setHoldTimer] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    api.get('/services').then(r => {
      setServices(r.data);
      const preselectedId = searchParams.get('service');
      if (preselectedId) {
        const svc = r.data.find(s => s.id == preselectedId);
        if (svc) { setSelectedService(svc); setStep(2); }
      }
    });
    api.get('/barbers').then(r => setBarbers(r.data));
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedBarber) return;
    setTimeSlots([]);
    setSelectedTime('');
    api.get(`/barbers/${selectedBarber.id}/available-slots?date=${selectedDate}&service_id=${selectedService?.id || ''}`)
      .then(r => setTimeSlots(r.data)).catch(() => {});
  }, [selectedDate, selectedBarber]);

  const getServiceIcon = (icon) => {
    const map = { scissors: Icons.Scissors, package: Icons.Package, eye: Icons.Eye };
    const Ic = map[icon] || Icons.Scissors;
    return <Ic size={20} className="text-[#f5b800]" />;
  };

  const handleWhatsAppPress = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const whatsapp = settings.whatsapp || '5549999183044';
    const msg = encodeURIComponent(
      `Olá! Gostaria de agendar:\n• Serviço: ${selectedService?.name}\n• Barbeiro: ${selectedBarber?.name}\n• Data: ${selectedDate}\n• Horário: ${selectedTime}\n• Nome: ${user.name}\n• Tel: ${user.phone || 'N/A'}`
    );
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
  };

  const startHold = () => {
    if (!user) { navigate('/login'); return; }
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        handleAutoBook();
      }
    }, 100);
    setHoldTimer(interval);
  };

  const endHold = () => {
    if (holdTimer) clearInterval(holdTimer);
    setHoldTimer(null);
    if (holdProgress < 100) setHoldProgress(0);
  };

  const handleAutoBook = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    setLoading(true);
    try {
      const { data } = await api.post('/appointments', {
        service_id: selectedService.id,
        barber_id: selectedBarber.id,
        date: selectedDate,
        time: selectedTime,
        notes
      });
      setBooked(data);
      const whatsapp = settings.whatsapp || '5549999183044';
      const msg = encodeURIComponent(
        `Agendamento confirmado!\n• Serviço: ${selectedService.name}\n• Barbeiro: ${selectedBarber.name}\n• Data: ${selectedDate}\n• Horário: ${selectedTime}\n• Nome: ${user.name}`
      );
      window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao agendar');
    } finally {
      setLoading(false);
      setHoldProgress(0);
    }
  };

  if (booked) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-96">
        <div className="card p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center mx-auto mb-4">
            <Icons.Check size={28} className="text-green-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">
            {lang ? 'BOOKING CONFIRMED!' : 'AGENDAMENTO CONFIRMADO!'}
          </h2>
          <p className="text-[#a0a0a0] mb-6">
            {selectedService?.name} com {selectedBarber?.name} em {selectedDate} às {selectedTime}
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate('/my-appointments')} className="btn-gold w-full py-3 text-sm">
              {lang ? 'VIEW MY BOOKINGS' : 'VER MEUS AGENDAMENTOS'}
            </button>
            <button onClick={() => { setBooked(null); setStep(1); setSelectedService(null); setSelectedBarber(null); setSelectedDate(''); setSelectedTime(''); }}
              className="btn-outline w-full py-3 text-sm">
              {lang ? 'NEW BOOKING' : 'NOVO AGENDAMENTO'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white mb-1">{lang ? 'ONLINE BOOKING' : 'AGENDAMENTO ONLINE'}</h1>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-[#f5b800] text-black' : 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a]'}`}>
                {step > s ? <Icons.Check size={14} /> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-[#f5b800]' : 'bg-[#2a2a2a]'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#a0a0a0]">
          <span>{lang ? 'Service' : 'Serviço'}</span>
          <span>{lang ? 'Barber' : 'Barbeiro'}</span>
          <span>{lang ? 'Date/Time' : 'Data/Hora'}</span>
          <span>{lang ? 'Confirm' : 'Confirmar'}</span>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-slide-up">
          <h2 className="section-title text-lg text-white mb-4">{lang ? 'Select a Service' : 'Selecione um Serviço'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map(service => (
              <div key={service.id}
                onClick={() => { setSelectedService(service); setStep(2); }}
                className={`service-card cursor-pointer ${selectedService?.id === service.id ? 'selected' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(245,184,0,0.1)] flex items-center justify-center">
                    {getServiceIcon(service.icon)}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#a0a0a0] tracking-widest">VALOR</p>
                    <p className="font-display font-bold text-xl text-white">R$ {parseFloat(service.price).toFixed(2)}</p>
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-1">{service.name.toUpperCase()}</h3>
                {service.description && <p className="text-[#a0a0a0] text-xs mb-2">{service.description}</p>}
                <div className="flex items-center gap-1 text-[#a0a0a0] text-xs">
                  <Icons.Clock size={12} /> {service.duration} MIN
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep(1)} className="text-[#a0a0a0] hover:text-white transition-colors">
              <Icons.ChevronLeft size={20} />
            </button>
            <h2 className="section-title text-lg text-white">{lang ? 'Select a Barber' : 'Selecione um Barbeiro'}</h2>
          </div>
          <div className="selected-summary p-3 rounded-lg bg-[rgba(245,184,0,0.05)] border border-[rgba(245,184,0,0.2)] mb-4 flex items-center gap-3">
            <Icons.Scissors size={16} className="text-[#f5b800]" />
            <span className="text-white font-semibold">{selectedService?.name}</span>
            <span className="text-[#a0a0a0] text-sm">R$ {parseFloat(selectedService?.price || 0).toFixed(2)} • {selectedService?.duration} min</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {barbers.map(barber => (
              <div key={barber.id}
                onClick={() => { setSelectedBarber(barber); setStep(3); }}
                className={`card p-4 cursor-pointer ${selectedBarber?.id === barber.id ? 'border-[#f5b800]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0">
                    {barber.photo ? (
                      <img src={barber.photo} alt={barber.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold text-xl">
                        {barber.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white">{barber.name}</h3>
                    {barber.specialty && <p className="text-[#a0a0a0] text-sm">{barber.specialty}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep(2)} className="text-[#a0a0a0] hover:text-white transition-colors">
              <Icons.ChevronLeft size={20} />
            </button>
            <h2 className="section-title text-lg text-white">{lang ? 'Select Date & Time' : 'Selecione Data e Hora'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <BookingCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                barberId={selectedBarber?.id}
                serviceId={selectedService?.id}
              />
            </div>
            <div className="card p-4">
              <h3 className="section-title text-sm text-white mb-3">{lang ? 'AVAILABLE TIMES' : 'HORÁRIOS DISPONÍVEIS'}</h3>
              {!selectedDate ? (
                <p className="text-[#a0a0a0] text-sm">{lang ? 'Select a date first' : 'Selecione uma data primeiro'}</p>
              ) : timeSlots.length === 0 ? (
                <p className="text-[#a0a0a0] text-sm">{lang ? 'No available slots' : 'Nenhum horário disponível'}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <button key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`time-slot ${selectedTime === time ? 'selected' : ''}`}>
                      {time}
                    </button>
                  ))}
                </div>
              )}
              {selectedDate && selectedTime && (
                <button onClick={() => setStep(4)} className="btn-gold w-full mt-4 py-2.5 text-sm">
                  {lang ? 'CONTINUE' : 'CONTINUAR'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-slide-up max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep(3)} className="text-[#a0a0a0] hover:text-white transition-colors">
              <Icons.ChevronLeft size={20} />
            </button>
            <h2 className="section-title text-lg text-white">{lang ? 'Confirm Booking' : 'Confirmar Agendamento'}</h2>
          </div>

          <div className="card p-5 mb-4 space-y-4">
            {[
              { label: lang ? 'Service' : 'Serviço', value: `${selectedService?.name} - R$ ${parseFloat(selectedService?.price || 0).toFixed(2)}` },
              { label: lang ? 'Barber' : 'Barbeiro', value: selectedBarber?.name },
              { label: lang ? 'Date' : 'Data', value: selectedDate },
              { label: lang ? 'Time' : 'Horário', value: selectedTime },
              { label: lang ? 'Duration' : 'Duração', value: `${selectedService?.duration} min` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-[#1a1a1a] last:border-0">
                <span className="text-[#a0a0a0] text-sm">{label}</span>
                <span className="text-white font-semibold text-sm">{value}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'NOTES (OPTIONAL)' : 'OBSERVAÇÕES (OPCIONAL)'}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="input-dark h-20 resize-none"
              placeholder={lang ? 'Any special requests...' : 'Alguma observação especial...'} />
          </div>

          {!user ? (
            <div className="space-y-3">
              <p className="text-[#a0a0a0] text-sm text-center">{lang ? 'You need to login to book automatically' : 'Faça login para agendar automaticamente'}</p>
              <button onClick={() => navigate('/login')} className="btn-gold w-full py-3 text-sm">
                {lang ? 'LOGIN TO BOOK' : 'ENTRAR PARA AGENDAR'}
              </button>
              <button onClick={handleWhatsAppPress} className="whatsapp-btn w-full justify-center py-3 text-sm">
                <Icons.Whatsapp size={18} />
                {lang ? 'CONFIRM VIA WHATSAPP' : 'CONFIRMAR VIA WHATSAPP'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[#a0a0a0] text-xs text-center">
                {lang ? 'Click for WhatsApp • Hold 2s to book automatically' : 'Clique para WhatsApp • Segure 2s para agendar automático'}
              </p>
              <div className="relative">
                <button
                  onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
                  onTouchStart={startHold} onTouchEnd={endHold}
                  onClick={holdProgress === 0 ? handleWhatsAppPress : undefined}
                  disabled={loading}
                  className="whatsapp-btn w-full justify-center py-3 text-sm relative overflow-hidden">
                  {holdProgress > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 bg-[rgba(0,0,0,0.3)] transition-none" style={{ width: `${holdProgress}%` }} />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icons.Whatsapp size={18} />
                    {loading ? (lang ? 'BOOKING...' : 'AGENDANDO...') : (lang ? 'CONFIRM ON WHATSAPP' : 'CONFIRMAR NO WHATSAPP')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
