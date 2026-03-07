import React, { useEffect, useState } from 'react';
import { Icons } from '../../components/Icons';
import api from '../../api';

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [modal, setModal] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [form, setForm] = useState({ name: '', specialty: '', bio: '', photo: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadBarbers(); }, []);

  const loadBarbers = () => {
    api.get('/barbers/all').then(r => setBarbers(r.data));
  };

  const openAdd = () => { setForm({ name: '', specialty: '', bio: '', photo: '' }); setModal('add'); };
  const openEdit = (b) => { setForm({ name: b.name, specialty: b.specialty || '', bio: b.bio || '', photo: b.photo || '' }); setModal(b.id); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/barbers', form);
      } else {
        await api.put(`/barbers/${modal}`, form);
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

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title text-3xl text-white">BARBEIROS</h1>
        <button onClick={openAdd} className="btn-gold px-4 py-2 text-sm flex items-center gap-2">
          <Icons.Plus size={16} /> Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map(b => (
          <div key={b.id} className={`card p-4 ${!b.active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0 border border-[#f5b800]">
                {b.photo ? (
                  <img src={b.photo} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold text-xl">
                    {b.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-white">{b.name}</h3>
                {b.specialty && <p className="text-[#a0a0a0] text-sm">{b.specialty}</p>}
                <span className={`badge ${b.active ? 'badge-success' : 'badge-danger'} mt-1`}>
                  {b.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            {b.bio && <p className="text-[#a0a0a0] text-xs mb-3">{b.bio}</p>}
            <div className="flex gap-2">
              <button onClick={() => openEdit(b)} className="flex-1 btn-outline py-1.5 text-xs flex items-center justify-center gap-1">
                <Icons.Edit size={12} /> Editar
              </button>
              <button onClick={() => setScheduleModal(b)} className="flex-1 py-1.5 text-xs border border-[#2a2a2a] rounded-lg text-[#a0a0a0] hover:border-[#f5b800] hover:text-[#f5b800] transition-all flex items-center justify-center gap-1">
                <Icons.Clock size={12} /> Horários
              </button>
              {b.active ? (
                <button onClick={() => handleDelete(b.id)} title="Desativar" className="px-2 py-1.5 text-xs border border-[rgba(239,68,68,0.3)] rounded-lg text-red-400 hover:bg-[rgba(239,68,68,0.1)]">
                  <Icons.EyeOff size={12} />
                </button>
              ) : (
                <button onClick={() => handleDelete(b.id, true)} title="Excluir Permanentemente" className="px-2 py-1.5 text-xs bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors">
                  <Icons.Trash size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(modal === 'add' || typeof modal === 'number') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-white text-xl mb-4">
              {modal === 'add' ? 'ADICIONAR BARBEIRO' : 'EDITAR BARBEIRO'}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <label className="relative cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-[#2a2a2a] border-2 border-[#f5b800] overflow-hidden flex items-center justify-center">
                    {form.photo ? (
                      <img src={form.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icons.Camera size={24} className="text-[#a0a0a0]" />
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
              {[
                { key: 'name', label: 'NOME', placeholder: 'Nome do barbeiro', required: true },
                { key: 'specialty', label: 'ESPECIALIDADE', placeholder: 'Ex: Cortes Modernos & Degradê' },
                { key: 'bio', label: 'BIO', placeholder: 'Breve descrição', textarea: true },
              ].map(({ key, label, placeholder, required, textarea }) => (
                <div key={key}>
                  <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">{label}</label>
                  {textarea ? (
                    <textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="input-dark h-20 resize-none" placeholder={placeholder} />
                  ) : (
                    <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="input-dark" placeholder={placeholder} required={required} />
                  )}
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 py-2.5 text-sm">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="btn-gold flex-1 py-2.5 text-sm">
                  {saving ? 'Salvando...' : 'SALVAR'}
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-lg" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-white text-xl mb-4">HORÁRIOS - {barber.name.toUpperCase()}</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {schedules.map((s, i) => (
            <div key={s.day_of_week} className={`p-3 rounded-lg border ${s.active ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)]'}`}>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!s.active}
                    onChange={e => { const n = [...schedules]; n[i] = { ...s, active: e.target.checked }; setSchedules(n); }}
                    className="accent-[#f5b800]" />
                  <span className="text-white text-sm font-semibold w-16">{DAYS[s.day_of_week]}</span>
                </label>
                {s.active && (
                  <div className="flex items-center gap-2 text-sm">
                    <input type="time" value={s.start_time}
                      onChange={e => { const n = [...schedules]; n[i] = { ...s, start_time: e.target.value }; setSchedules(n); }}
                      className="bg-[#0d0d0d] border border-[#2a2a2a] rounded px-2 py-1 text-white text-xs" />
                    <span className="text-[#a0a0a0]">-</span>
                    <input type="time" value={s.end_time}
                      onChange={e => { const n = [...schedules]; n[i] = { ...s, end_time: e.target.value }; setSchedules(n); }}
                      className="bg-[#0d0d0d] border border-[#2a2a2a] rounded px-2 py-1 text-white text-xs" />
                  </div>
                )}
                {!s.active && <span className="text-red-400 text-xs">Folga</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">Cancelar</button>
          <button onClick={handleSave} className="btn-gold flex-1 py-2.5 text-sm">SALVAR</button>
        </div>
      </div>
    </div>
  );
}
