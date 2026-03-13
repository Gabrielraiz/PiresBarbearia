import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Icons from '../components/Icons';
import BookingCalendar from '../components/BookingCalendar';
import api from '../api';
import { fetchWithCache } from '../lib/requestCache';
import { getApiErrorMessage } from '../lib/apiError';

export default function Booking() {
  const { user } = useAuth();
  const { settings, t, labels } = useSettings();
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
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [holdTimer, setHoldTimer] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [booked, setBooked] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState({ enabled: false, provider: 'mercadopago' });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [pixPayment, setPixPayment] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchWithCache('services:list', async () => {
        const response = await api.get('/services');
        return response.data;
      }, 60000),
      fetchWithCache('barbers:list', async () => {
        const response = await api.get('/barbers');
        return response.data;
      }, 60000),
      fetchWithCache('payments:config', async () => {
        const response = await api.get('/payments/config');
        return response.data;
      }, 30000),
    ]).then(([servicesData, barbersData, paymentsData]) => {
      if (!mounted) return;
      setServices(servicesData);
      setBarbers(barbersData);
      setPaymentConfig(paymentsData);
      if (paymentsData.provider === 'stripe') {
        setPaymentMethod('credit_card');
      }
      const preselectedSvcId = searchParams.get('service');
      const preselectedBarberId = searchParams.get('barber');
      
      if (preselectedSvcId) {
        const svc = servicesData.find(s => s.id == preselectedSvcId);
        if (svc) { setSelectedService(svc); setStep(2); }
      }
      
      if (preselectedBarberId) {
        const brb = barbersData.find(b => b.id == preselectedBarberId);
        if (brb) { 
          setSelectedBarber(brb); 
          // Se já tiver serviço, vai para o passo 3, senão fica no 2
          if (preselectedSvcId) setStep(3);
          else setStep(2);
        }
      }
    }).catch((err) => {
      if (!mounted) return;
      setErrorMessage(getApiErrorMessage(err, t('Não foi possível carregar os dados de agendamento.', 'Unable to load booking data.')));
    }).finally(() => {
      if (mounted) setPageLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedBarber) return;
    setTimeSlots([]);
    setSelectedTime('');
    const cacheKey = `slots:${selectedBarber.id}:${selectedDate}:${selectedService?.id || 'all'}`;
    fetchWithCache(cacheKey, async () => {
      const response = await api.get(`/barbers/${selectedBarber.id}/available-slots?date=${selectedDate}&service_id=${selectedService?.id || ''}`);
      return response.data;
    }, 15000).then((slots) => setTimeSlots(slots)).catch((err) => {
      setErrorMessage(getApiErrorMessage(err, 'Falha ao carregar horários disponíveis.'));
    });
  }, [selectedDate, selectedBarber]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    try {
      const { data } = await api.get(`/promotions/validate/${promoCode}`);
      
      // Check if it applies to the selected service
      if (data.service_id && selectedService && data.service_id !== selectedService.id) {
        throw new Error(`Este cupom só é válido para o serviço: ${services.find(s => s.id === data.service_id)?.name || 'específico'}`);
      }
      
      // Check min value
      if (data.min_value && selectedService && selectedService.price < data.min_value) {
        throw new Error(`Este cupom requer um valor mínimo de R$ ${data.min_value}`);
      }
      
      setAppliedPromo(data);
      setPromoCode('');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Erro ao validar cupom');
    } finally {
      setPromoLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    let total = selectedService.price;
    if (appliedPromo) {
      if (appliedPromo.discount_type === 'percentage') {
        total -= (total * appliedPromo.discount_value) / 100;
      } else {
        total -= appliedPromo.discount_value;
      }
    }
    return Math.max(0, total);
  };

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
      `${t('Olá! Gostaria de agendar:', 'Hello! I would like to schedule:')}\n• ${t('Serviço', 'Service')}: ${selectedService?.name}\n• ${t('Profissional', 'Professional')}: ${selectedBarber?.name}\n• ${t('Data', 'Date')}: ${selectedDate}\n• ${t('Horário', 'Time')}: ${selectedTime}\n• ${t('Nome', 'Name')}: ${user.name}\n• Tel: ${user.phone || 'N/A'}`
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

  const createAppointment = async () => {
    const { data } = await api.post('/appointments', {
      service_id: selectedService.id,
      barber_id: selectedBarber.id,
      date: selectedDate,
      time: selectedTime,
      notes
    });
    return data;
  };

  const handleAutoBook = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await createAppointment();
      setBooked(data);
      // Don't open WhatsApp automatically. Let the user see the confirmation card first.
      // We will provide a button on the confirmation card to talk on WhatsApp if they wish.
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Erro ao agendar'));
    } finally {
      setLoading(false);
      setHoldProgress(0);
    }
  };

  const handlePayAndBook = async () => {
    if (!paymentConfig.enabled || !selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    setLoading(true);
    setErrorMessage('');
    setPixPayment(null);
    try {
      const appointment = await createAppointment();
      const payload = {
        appointmentId: appointment.id,
        servicePrice: selectedService.price,
        paymentMethod,
      };
      const { data } = await api.post('/payments/checkout', payload);
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.paymentMethod === 'pix') {
        setBooked(appointment);
        setPixPayment(data);
        return;
      }
      setBooked(appointment);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível iniciar o pagamento.'));
    } finally {
      setLoading(false);
      setHoldProgress(0);
    }
  };

  if (booked) {
    const handleConfirmOnWhatsApp = () => {
      const whatsapp = settings.whatsapp || '5549999183044';
      const msg = encodeURIComponent(
        `${t('Agendamento confirmado!', 'Booking confirmed!')}\n• ${t('Serviço', 'Service')}: ${selectedService?.name}\n• ${t('Profissional', 'Professional')}: ${selectedBarber?.name}\n• ${t('Data', 'Date')}: ${selectedDate}\n• ${t('Horário', 'Time')}: ${selectedTime}\n• ${t('Nome', 'Name')}: ${user?.name}`
      );
      window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
    };

    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-96">
        <div className="card p-8 max-w-md w-full text-center animate-slide-up border-[var(--gold)]/30 shadow-[0_0_50px_rgba(245,184,0,0.1)]">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Icons.Check size={40} className="text-green-500" />
          </div>
          <h2 className="font-display font-black text-3xl text-white mb-4 tracking-tighter uppercase italic leading-none">
            {lang ? 'BOOKING CONFIRMED!' : 'AGENDAMENTO CONFIRMADO!'}
          </h2>
          <div className="p-5 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border)] mb-8 space-y-2">
            <p className="text-white font-black text-lg tracking-tighter uppercase italic">{selectedService?.name}</p>
            <div className="flex items-center justify-center gap-2 text-[var(--gold)] text-[10px] font-black tracking-widest uppercase">
              <Icons.User size={12} /> {selectedBarber?.name}
            </div>
            <div className="flex items-center justify-center gap-3 text-[var(--text-secondary)] text-xs font-bold mt-2">
              <span className="flex items-center gap-1"><Icons.Calendar size={12} /> {selectedDate}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
              <span className="flex items-center gap-1"><Icons.Clock size={12} /> {selectedTime}</span>
            </div>
          </div>
          
          {pixPayment?.qrCodeBase64 && (
            <div className="mb-8 p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-main)] shadow-inner group">
              <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.2em] uppercase mb-4 italic">PAGAMENTO VIA PIX</p>
              <img src={`data:image/png;base64,${pixPayment.qrCodeBase64}`} alt="PIX QR Code" className="w-52 h-52 mx-auto rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500" />
              <p className="text-[var(--text-secondary)] text-[9px] mt-4 uppercase font-bold tracking-widest italic">{t('Escaneie para finalizar o pagamento', 'Scan to complete payment')}</p>
            </div>
          )}
          <div className="space-y-4">
            <button onClick={handleConfirmOnWhatsApp} className="whatsapp-btn w-full justify-center py-5 text-xs font-black tracking-widest shadow-2xl shadow-green-500/20 active:scale-95">
              <Icons.Whatsapp size={20} />
              {lang ? 'TALK ON WHATSAPP' : 'FALAR NO WHATSAPP'}
            </button>
            <button onClick={() => navigate('/my-appointments')} className="w-full py-5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-black text-xs tracking-widest uppercase rounded-2xl hover:border-[var(--gold)]/50 transition-all active:scale-95">
              {lang ? 'MY BOOKINGS' : 'MEUS AGENDAMENTOS'}
            </button>
            <button onClick={() => { setBooked(null); setPixPayment(null); setStep(1); setSelectedService(null); setSelectedBarber(null); setSelectedDate(''); setSelectedTime(''); }}
              className="text-[var(--text-secondary)] hover:text-[var(--gold)] text-[9px] font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2 mx-auto italic mt-4">
              {lang ? 'NEW BOOKING' : 'NOVO AGENDAMENTO'}
              <Icons.ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-12 min-h-screen ${settings.theme === 'dark' ? 'bg-[#0d0d0d]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
            <Icons.AlertCircle size={16} />
            {errorMessage}
          </div>
        )}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
            <span className="text-[var(--gold)] font-black tracking-[0.3em] text-xs uppercase">Step {step} of 4</span>
          </div>
          <h1 className={`page-title text-5xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{lang ? 'ONLINE BOOKING' : 'AGENDAMENTO ONLINE'}</h1>
          
          <div className="flex items-center gap-4 mt-10">
            {[1, 2, 3, 4].map(s => (
              <React.Fragment key={s}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 ${step >= s ? 'bg-[var(--gold)] text-black shadow-xl shadow-[var(--gold)]/20 scale-110' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
                  {step > s ? <Icons.Check size={20} /> : s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 rounded-full transition-all duration-700 ${step > s ? 'bg-[var(--gold)]' : 'bg-[var(--border)]'}`} />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)]">
            <span className={step >= 1 ? 'text-[var(--gold)]' : ''}>{lang ? 'Service' : 'Serviço'}</span>
            <span className={step >= 2 ? 'text-[var(--gold)]' : ''}>{labels.professional}</span>
            <span className={step >= 3 ? 'text-[var(--gold)]' : ''}>{lang ? 'Date/Time' : 'Data/Hora'}</span>
            <span className={step >= 4 ? 'text-[var(--gold)]' : ''}>{lang ? 'Confirm' : 'Confirmar'}</span>
          </div>
        </div>

        {pageLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] animate-pulse" />
            ))}
          </div>
        )}

        {!pageLoading && step === 1 && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <h2 className={`section-title text-2xl mb-8 ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{lang ? 'Select a Service' : 'Selecione um Serviço'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {services.map(service => (
                <div key={service.id}
                  onClick={() => { setSelectedService(service); setStep(2); }}
                  className={`service-card p-8 group cursor-pointer ${selectedService?.id === service.id ? 'selected ring-2 ring-[var(--gold)]' : ''}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center group-hover:bg-[var(--gold)]/20 transition-all">
                      {getServiceIcon(service.icon)}
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black tracking-[0.2em] ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>INVESTIMENTO</p>
                      <p className={`font-display font-black text-2xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>R$ {parseFloat(service.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <h3 className={`font-display font-black text-xl mb-2 tracking-tighter group-hover:text-[var(--gold)] transition-colors ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{service.name.toUpperCase()}</h3>
                  <div className={`flex items-center gap-2 text-xs font-bold ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>
                    <Icons.Clock size={14} className="text-[var(--gold)]" /> {service.duration} MIN
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!pageLoading && step === 2 && (
          <div className="animate-in slide-in-from-right-8 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep(1)} className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all">
                <Icons.ChevronLeft size={24} />
              </button>
              <h2 className={`section-title text-2xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{t(`Selecione ${labels.professional}`, `Select ${labels.professional}`)}</h2>
            </div>
            
            <div className="p-6 rounded-2xl bg-[var(--gold)]/5 border-2 border-[var(--gold)]/20 mb-10 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-[var(--gold)] flex items-center justify-center text-black">
                <Icons.Scissors size={24} />
              </div>
              <div>
                <p className={`text-[10px] font-black tracking-[0.2em] uppercase ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{t('SERVIÇO SELECIONADO', 'SELECTED SERVICE')}</p>
                <p className={`text-lg font-black tracking-tighter ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{selectedService?.name} • R$ {parseFloat(selectedService?.price || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {barbers.map(barber => (
                <div key={barber.id}
                  onClick={() => { setSelectedBarber(barber); setSelectedDate(''); setSelectedTime(''); setStep(3); }}
                  className={`card p-8 group cursor-pointer border-2 transition-all ${selectedBarber?.id === barber.id ? 'border-[var(--gold)] bg-[var(--gold)]/5' : 'border-[var(--border)] hover:border-[var(--gold)]/50'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-[var(--bg-main)] border-2 border-[var(--border)] overflow-hidden flex-shrink-0 group-hover:border-[var(--gold)] transition-all shadow-xl">
                      {barber.photo ? (
                        <img src={barber.photo} alt={barber.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--gold)] font-black text-3xl">
                          {barber.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-display font-black text-2xl tracking-tighter group-hover:text-[var(--gold)] transition-colors ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{barber.name}</h3>
                      {barber.specialty && <p className={`text-sm font-bold mt-1 ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{barber.specialty}</p>}
                      <div className="mt-4 flex gap-1">
                        {[1,2,3,4,5].map(star => <Icons.Star key={star} size={12} className="text-[var(--gold)]" filled />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!pageLoading && step === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep(2)} className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all">
                <Icons.ChevronLeft size={24} />
              </button>
              <h2 className={`section-title text-2xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{lang ? 'Select Date & Time' : 'Selecione Data e Hora'}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 card p-8 shadow-2xl">
                <BookingCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  barberId={selectedBarber?.id}
                  serviceId={selectedService?.id}
                />
              </div>
              <div className="lg:col-span-5 card p-8 shadow-2xl flex flex-col">
                <h3 className={`section-title text-xs text-[var(--gold)] mb-8 tracking-[0.3em] uppercase font-black`}>{lang ? 'AVAILABLE TIMES' : 'HORÁRIOS DISPONÍVEIS'}</h3>
                {!selectedDate ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50">
                    <Icons.Clock size={48} className="mb-4 text-[var(--text-secondary)]" />
                    <p className={`text-sm font-bold ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{lang ? 'Select a date first' : 'Selecione uma data primeiro'}</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                      <Icons.X size={32} />
                    </div>
                    <p className={`text-sm font-bold ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{lang ? 'No available slots' : 'Nenhum horário disponível para esta data'}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map(time => (
                        <button key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-4 rounded-xl font-black text-sm transition-all border-2 ${selectedTime === time ? 'bg-[var(--gold)] text-black border-[var(--gold)] shadow-lg shadow-[var(--gold)]/20 scale-105' : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--gold)]/50'}`}>
                          {time}
                        </button>
                      ))}
                    </div>
                    {selectedTime && (
                      <button onClick={() => setStep(4)} className="btn-gold w-full mt-auto pt-5 pb-5 text-sm font-black shadow-2xl shadow-[var(--gold)]/20 animate-in fade-in duration-500">
                        {lang ? 'CONTINUE' : 'CONTINUAR'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {!pageLoading && step === 4 && (
          <div className="animate-in zoom-in-95 duration-700 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep(3)} className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all">
                <Icons.ChevronLeft size={24} />
              </button>
              <h2 className={`section-title text-2xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{lang ? 'Confirm Booking' : 'Confirmar Agendamento'}</h2>
            </div>

            <div className="card p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)]" />
              <div className="space-y-6 mb-10">
                {[
                  { label: lang ? 'Service' : 'Serviço', value: selectedService?.name, icon: Icons.Scissors },
                  { label: lang ? 'Price' : 'Investimento', value: `R$ ${parseFloat(selectedService?.price || 0).toFixed(2)}`, icon: Icons.Star },
                  { label: t('Profissional', 'Professional'), value: selectedBarber?.name, icon: Icons.User },
                  { label: lang ? 'Date' : 'Data', value: selectedDate, icon: Icons.Calendar },
                  { label: lang ? 'Time' : 'Horário', value: selectedTime, icon: Icons.Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex justify-between items-center py-4 border-b border-[var(--border)] group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/5 flex items-center justify-center text-[var(--gold)] group-hover/item:bg-[var(--gold)] group-hover/item:text-black transition-all">
                        <Icon size={18} />
                      </div>
                      <span className={`text-xs font-black tracking-widest uppercase ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{label}</span>
                    </div>
                    <span className={`text-lg font-black tracking-tighter ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-10">
                <label className={`block text-[10px] font-black mb-3 tracking-[0.2em] uppercase ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{lang ? 'NOTES (OPTIONAL)' : 'OBSERVAÇÕES (OPCIONAL)'}</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="input-dark h-32 resize-none py-4"
                  placeholder={lang ? 'Any special requests...' : 'Alguma observação especial...'} />
              </div>

              {/* Promo Code Input */}
              {!appliedPromo ? (
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={promoCode} 
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="CUPOM DE DESCONTO"
                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs font-black tracking-widest outline-none focus:border-[var(--gold)]"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode}
                    className="px-6 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--gold)] text-[10px] font-black tracking-widest uppercase rounded-xl hover:border-[var(--gold)] disabled:opacity-50 transition-all"
                  >
                    {promoLoading ? '...' : 'APLICAR'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-4 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2">
                    <Icons.Tag size={14} className="text-green-500" />
                    <span className="text-[10px] font-black text-green-500 tracking-widest uppercase">CUPOM APLICADO!</span>
                  </div>
                  <button onClick={() => setAppliedPromo(null)} className="text-green-500/50 hover:text-red-500 transition-colors">
                    <Icons.X size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between py-4 border-t border-[var(--border)]">
                <span className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase italic">{t('TOTAL ESTIMADO', 'ESTIMATED TOTAL')}</span>
                <div className="text-right">
                  {appliedPromo && (
                    <p className="text-[10px] font-black text-red-500 line-through tracking-tighter opacity-50">R$ {parseFloat(selectedService?.price || 0).toFixed(2)}</p>
                  )}
                  <span className="text-[var(--gold)] font-display font-black text-3xl tracking-tighter italic">R$ {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {user && paymentConfig.enabled && (
                <div className="mb-8 p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4">
                    {lang ? 'PAYMENT METHOD' : 'FORMA DE PAGAMENTO'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`py-3 rounded-xl border text-[10px] font-black tracking-widest uppercase ${
                        paymentMethod === 'credit_card' ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10' : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {paymentConfig.provider === 'stripe' ? 'Stripe' : 'Cartão'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`py-3 rounded-xl border text-[10px] font-black tracking-widest uppercase ${
                        paymentMethod === 'pix' ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10' : 'border-[var(--border)] text-[var(--text-secondary)]'
                      } ${paymentConfig.provider === 'stripe' ? 'opacity-40 cursor-not-allowed' : ''}`}
                      disabled={paymentConfig.provider === 'stripe'}
                    >
                      PIX
                    </button>
                  </div>
                </div>
              )}

              {!user ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-blue-500/10 border-2 border-blue-500/20 text-blue-500 text-sm font-bold flex items-center gap-4">
                    <Icons.Shield size={24} />
                    <p>{lang ? 'Login required for automatic booking' : 'Faça login para confirmar seu agendamento instantaneamente'}</p>
                  </div>
                  <button onClick={() => navigate('/login')} className="btn-gold w-full py-5 text-sm font-black shadow-2xl shadow-[var(--gold)]/20">
                    {lang ? 'LOGIN TO BOOK' : 'ENTRAR PARA AGENDAR'}
                  </button>
                  <div className="relative flex items-center py-4">
                    <div className="flex-1 border-t border-[var(--border)]" />
                    <span className={`px-4 text-[10px] font-black tracking-[0.3em] uppercase ${settings.theme === 'dark' ? 'text-[#444]' : 'text-[#9ca3af]'}`}>OU</span>
                    <div className="flex-1 border-t border-[var(--border)]" />
                  </div>
                  <button onClick={handleWhatsAppPress} className="whatsapp-btn w-full justify-center py-5 text-sm font-black shadow-2xl shadow-green-500/20">
                    <Icons.Whatsapp size={20} />
                    {lang ? 'CONFIRM VIA WHATSAPP' : 'CONFIRMAR VIA WHATSAPP'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {paymentConfig.enabled && (
                    <button
                      onClick={handlePayAndBook}
                      disabled={loading}
                      className="btn-gold w-full justify-center py-5 text-sm font-black shadow-2xl shadow-[var(--gold)]/20"
                    >
                      {loading ? (lang ? 'PROCESSING...' : 'PROCESSANDO...') : (lang ? 'BOOK AND PAY NOW' : 'AGENDAR E PAGAR AGORA')}
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
                      onTouchStart={startHold} onTouchEnd={endHold}
                      onClick={holdProgress === 0 ? handleWhatsAppPress : undefined}
                      disabled={loading}
                      className="whatsapp-btn w-full justify-center py-6 text-sm font-black relative overflow-hidden shadow-2xl shadow-green-500/20 group">
                      {holdProgress > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 bg-black/30 transition-none" style={{ width: `${holdProgress}%` }} />
                      )}
                      <span className="relative flex items-center gap-3">
                        <Icons.Whatsapp size={22} className="group-hover:scale-125 transition-transform" />
                        {loading ? (lang ? 'PROCESSING...' : 'PROCESSANDO...') : (lang ? 'HOLD TO BOOK INSTANTLY' : 'SEGURE PARA AGENDAR')}
                      </span>
                    </button>
                  </div>
                  <p className={`text-center text-[10px] font-black tracking-[0.2em] uppercase ${settings.theme === 'dark' ? 'text-[#444]' : 'text-[#9ca3af]'}`}>
                    {lang ? 'Click for WhatsApp • Hold 2s for Auto-Book' : 'Clique para WhatsApp • Segure 2s para agendar agora'}
                  </p>
                  {pixPayment?.qrCodeBase64 && (
                    <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] text-center">
                      <p className="text-xs font-bold text-[var(--text-secondary)] mb-3">PIX</p>
                      <img src={`data:image/png;base64,${pixPayment.qrCodeBase64}`} alt="PIX QR Code" className="w-48 h-48 mx-auto rounded-xl" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
