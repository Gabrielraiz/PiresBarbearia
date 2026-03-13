import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminBarbers() {
  const { t, labels } = useSettings();
  const [barbers, setBarbers] = useState([]);
  const [modal, setModal] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [form, setForm] = useState({ name: '', specialty: '', bio: '', photo: '', photos_json: '[]' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadBarbers(); }, []);

  const loadBarbers = () => {
    api.get('/barbers/all').then(r => setBarbers(r.data));
  };

  const openAdd = () => { setForm({ name: '', specialty: '', bio: '', photo: '', photos_json: '[]' }); setModal('add'); };
  const openEdit = (b) => { 
    setForm({ 
      name: b.name, 
      specialty: b.specialty || '', 
      bio: b.bio || '', 
      photo: b.photo || '',
      photos_json: b.photos_json || '[]'
    }); 
    setModal(b.id); 
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (modal === 'add') {
        await api.post('/barbers', payload);
      } else {
        await api.put(`/barbers/${modal}`, payload);
      }
      setModal(null);
      loadBarbers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, force = false) => {
    const msg = force 
      ? 'EXCLUIR PERMANENTEMENTE este barbeiro? Esta ação não pode ser desfeita.' 
      : 'Desativar este barbeiro? Ele não aparecerá mais para agendamentos.';
    
    if (!confirm(msg)) return;
    
    try {
      await api.delete(`/barbers/${id}${force ? '?force=true' : ''}`);
      loadBarbers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, photo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => {
          const currentPhotos = JSON.parse(prev.photos_json || '[]');
          return { ...prev, photos_json: JSON.stringify([...currentPhotos, ev.target.result]) };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryPhoto = (index) => {
    setForm(prev => {
      const currentPhotos = JSON.parse(prev.photos_json || '[]');
      const filtered = currentPhotos.filter((_, i) => i !== index);
      return { ...prev, photos_json: JSON.stringify(filtered) };
    });
  };

  const handleReactivate = async (id) => {
    try {
      await api.put(`/barbers/${id}`, { active: 1 });
      loadBarbers();
    } catch (err) {
      alert(err.response?.data?.message || t('Erro ao reativar', 'Failed to reactivate'));
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
            {labels.professionals.toUpperCase()} <span className="text-[var(--gold)]">ELITE</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
            <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
              {t('GESTÃO DOS PROFISSIONAIS E AGENDAS', 'PROFESSIONALS AND SCHEDULE MANAGEMENT')}
            </p>
          </div>
        </div>
        
        <button 
          onClick={openAdd} 
          className="group flex items-center justify-center gap-3 px-8 py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95"
        >
          <Icons.Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
          {t(`NOVO ${labels.professional}`.toUpperCase(), `NEW ${labels.professional}`.toUpperCase())}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {barbers.map(b => (
          <div 
            key={b.id} 
            className={`group relative card overflow-hidden border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[var(--gold)]/10 ${!b.active ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24 rounded-3xl bg-[var(--bg-main)] border-2 border-[var(--border)] group-hover:border-[var(--gold)] overflow-hidden flex-shrink-0 transition-all duration-500 shadow-2xl">
                  {b.photo ? (
                    <img src={b.photo} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--gold)] font-display font-black text-4xl italic">
                      {b.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-black text-[var(--text-primary)] text-2xl truncate group-hover:text-[var(--gold)] transition-colors uppercase italic tracking-tighter leading-none mb-3">
                    {b.name}
                  </h3>
                  <p className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.2em] mb-3 italic">
                    {b.specialty || t('PROFISSIONAL', 'PROFESSIONAL')}
                  </p>
                  <span className={`px-3 py-1 text-[8px] font-black tracking-[0.2em] uppercase rounded-full border ${
                    b.active 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {b.active ? t('DISPONÍVEL', 'AVAILABLE') : t('INATIVO', 'INACTIVE')}
                  </span>
                </div>
              </div>

              {b.bio && (
                <div className="mb-8 p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] group-hover:border-[var(--gold)]/20 transition-colors">
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed italic font-medium">
                    "{b.bio}"
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => openEdit(b)} 
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)] font-black text-[10px] tracking-[0.2em] uppercase rounded-xl hover:border-[var(--gold)] transition-all active:scale-95"
                >
                  <Icons.Edit size={14} className="text-[var(--gold)]" /> EDITAR
                </button>
                
                <button 
                  onClick={() => setScheduleModal(b)} 
                  title="Horários de Trabalho"
                  className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-main)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all active:scale-90"
                >
                  <Icons.Clock size={18} />
                </button>

                <div className="flex gap-2">
                  {b.active ? (
                    <button 
                      onClick={() => handleDelete(b.id)} 
                      title="Desativar Temporariamente" 
                      className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-main)] rounded-xl text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all active:scale-90"
                    >
                      <Icons.EyeOff size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReactivate(b.id)} 
                      className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-main)] rounded-xl text-green-400 hover:bg-green-500/10 hover:border-green-500/30 transition-all active:scale-90"
                    >
                      <Icons.Check size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(b.id, true)} 
                    title="Excluir Permanentemente" 
                    className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-main)] rounded-xl text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-90"
                  >
                    <Icons.Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Modernizado */}
      {(modal === 'add' || typeof modal === 'number') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-1">
                  {modal === 'add' ? 'ADMISSÃO' : 'ATUALIZAÇÃO'}
                </p>
                <h3 className="font-display font-black text-3xl text-[var(--text-primary)] tracking-tighter uppercase">
                  PERFIL DO <span className="text-[var(--gold)]">PROFISSIONAL</span>
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                <Icons.X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-center mb-4">
                <label className="group relative cursor-pointer">
                  <div className="w-28 h-28 rounded-3xl bg-[var(--bg-main)] border-2 border-dashed border-[var(--border)] group-hover:border-[var(--gold)] overflow-hidden flex flex-col items-center justify-center transition-all duration-300">
                    {form.photo ? (
                      <img src={form.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Icons.Camera size={32} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] transition-colors mb-2" />
                        <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">FOTO PERFIL</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.User size={14} /> NOME COMPLETO
                </label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none" 
                  placeholder="Ex: João da Silva" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.Star size={14} /> ESPECIALIDADE / CARGO
                </label>
                <input 
                  value={form.specialty} 
                  onChange={e => setForm({ ...form, specialty: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none" 
                  placeholder="Ex: Mestre em Barba & Navalha" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.FileText size={14} /> BIOGRAFIA PROFISSIONAL
                </label>
                <textarea 
                  value={form.bio} 
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none h-24 resize-none text-sm" 
                  placeholder="Conte um pouco sobre a experiência do profissional..." 
                />
              </div>

              {/* Gallery Section */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.Image size={14} /> PORTFÓLIO (GALERIA)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {JSON.parse(form.photos_json || '[]').map((photo, i) => (
                    <div key={i} className="relative group/photo aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeGalleryPhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-lg opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                        <Icons.X size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--gold)]/50 transition-all flex flex-col items-center justify-center cursor-pointer text-[var(--text-secondary)] hover:text-[var(--gold)]">
                    <Icons.Plus size={20} />
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-1">ADD</span>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setModal(null)} 
                  className="flex-1 py-4 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="flex-[2] py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'PROCESSANDO...' : 'CONFIRMAR PERFIL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {scheduleModal && (
        <BarberScheduleModal barber={scheduleModal} onClose={() => setScheduleModal(null)} />
      )}
    </div>
  );
}

function BarberScheduleModal({ barber, onClose }) {
  const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    api.get(`/barbers/${barber.id}/schedules`).then(r => {
      if (r.data.length > 0) {
        setSchedules(r.data);
      } else {
        setSchedules(DAYS.map((_, i) => ({ day_of_week: i, start_time: '09:00', end_time: '20:00', active: i !== 0 })));
      }
    });
  }, [barber.id]);

  const handleSave = async () => {
    await api.put(`/barbers/${barber.id}/schedules`, { schedules });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-1">PROGRAMAÇÃO</p>
            <h3 className="font-display font-black text-3xl text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">
              HORÁRIOS <span className="text-[var(--gold)]">DE {barber.name.split(' ')[0]}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {schedules.map((s, i) => (
            <div 
              key={s.day_of_week} 
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                s.active 
                  ? 'border-[var(--border)] bg-[var(--bg-main)] hover:border-[var(--gold)]/30' 
                  : 'border-red-500/20 bg-red-500/[0.02] opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={!!s.active}
                      onChange={e => { const n = [...schedules]; n[i] = { ...s, active: e.target.checked }; setSchedules(n); }}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--gold)] transition-colors" />
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest min-w-[80px]">
                    {DAYS[s.day_of_week]}
                  </span>
                </label>

                {s.active ? (
                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase ml-1">ENTRADA</p>
                      <input 
                        type="time" 
                        value={s.start_time}
                        onChange={e => { const n = [...schedules]; n[i] = { ...s, start_time: e.target.value }; setSchedules(n); }}
                        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[var(--gold)] transition-colors font-bold" 
                      />
                    </div>
                    <div className="h-4 w-[1px] bg-[var(--border)] mt-4" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase ml-1">SAÍDA</p>
                      <input 
                        type="time" 
                        value={s.end_time}
                        onChange={e => { const n = [...schedules]; n[i] = { ...s, end_time: e.target.value }; setSchedules(n); }}
                        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[var(--gold)] transition-colors font-bold" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500/50">
                    <Icons.Info size={14} />
                    <span className="text-[10px] font-black tracking-widest uppercase">DIA DE FOLGA</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-[var(--bg-main)]/50 border-t border-[var(--border)] flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSave} 
            className="flex-[2] py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95"
          >
            SALVAR PROGRAMAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
}
