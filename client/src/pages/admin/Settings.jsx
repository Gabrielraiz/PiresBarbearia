import React, { useEffect, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Icons } from '../../components/Icons';
import api from '../../api';

export default function AdminSettings() {
  const { settings: ctxSettings, refreshSettings } = useSettings();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('general');

  useEffect(() => { setForm({ ...ctxSettings }); }, [ctxSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', form);
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, site_logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ ...form, hero_bg: data.filename });
    } catch (err) {
      alert('Erro ao enviar imagem de fundo');
    }
  };

  const tabs = [
    { key: 'general', label: 'Geral', icon: Icons.Settings },
    { key: 'contact', label: 'Contato', icon: Icons.Phone },
    { key: 'appearance', label: 'Aparência', icon: Icons.Palette },
    { key: 'system', label: 'Sistema', icon: Icons.Shield },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">CONFIGURAÇÕES</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${tab === key ? 'bg-[#f5b800] text-black' : 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a]'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="p-3 rounded-lg mb-4 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-green-400 text-sm flex items-center gap-2">
          <Icons.Check size={16} /> Configurações salvas com sucesso!
        </div>
      )}

      <div className="card p-5 space-y-4">
        {tab === 'general' && (
          <>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">NOME DO SITE</label>
              <input value={form.site_name || ''} onChange={e => setForm({ ...form, site_name: e.target.value })}
                className="input-dark" placeholder="PiresQK Barbearia" />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">SLOGAN</label>
              <textarea value={form.site_tagline || ''} onChange={e => setForm({ ...form, site_tagline: e.target.value })}
                className="input-dark h-20 resize-none" placeholder="Transformando visual em identidade..." />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">INTERVALO ENTRE CORTES</label>
              <select value={form.appointment_interval || '30'} onChange={e => setForm({ ...form, appointment_interval: e.target.value })} className="input-dark">
                <option value="30">30 minutos</option>
                <option value="60">60 minutos (1 hora)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">IDIOMA PADRÃO</label>
              <select value={form.language || 'pt'} onChange={e => setForm({ ...form, language: e.target.value })} className="input-dark">
                <option value="pt">Português</option>
                <option value="en">English</option>
              </select>
            </div>
          </>
        )}

        {tab === 'contact' && (
          <>
            {[
              { key: 'phone', label: 'TELEFONE', placeholder: '(49) 99918-3044' },
              { key: 'whatsapp', label: 'NÚMERO WHATSAPP (COM DDI)', placeholder: '5549999183044' },
              { key: 'address', label: 'ENDEREÇO', placeholder: 'Rua das Flores, 123 - Centro' },
              { key: 'instagram', label: 'INSTAGRAM (URL)', placeholder: 'https://instagram.com/seuperfil' },
              { key: 'facebook', label: 'FACEBOOK (URL)', placeholder: 'https://facebook.com/suapagina' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{label}</label>
                <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input-dark" placeholder={placeholder} />
              </div>
            ))}
          </>
        )}

        {tab === 'appearance' && (
          <>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">LOGO DA BARBEARIA</label>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                <div className="w-24 h-24 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] flex items-center justify-center overflow-hidden relative group">
                  {form.site_logo ? (
                    <img src={form.site_logo} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <Icons.Image size={32} className="text-[#2a2a2a]" />
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Icons.Camera size={20} className="text-white" />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold mb-1">Upload de Logo</p>
                  <p className="text-[#a0a0a0] text-xs mb-3">Recomendado: PNG transparente ou SVG</p>
                  <button onClick={() => setForm({ ...form, site_logo: '' })} className="text-red-400 text-xs hover:underline flex items-center gap-1">
                    <Icons.Trash size={12} /> Remover logo
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">FOTO DE FUNDO DA HOME</label>
              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingTop: '40%' }}>
                  {form.hero_bg ? (
                    <>
                      <img src={form.hero_bg} alt="Fundo" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 pointer-events-none" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#2a2a2a]">
                      <Icons.Image size={40} />
                      <span className="text-xs mt-2">Prévia do fundo</span>
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 transition-colors text-white text-xs px-3 py-1.5 rounded cursor-pointer flex items-center gap-1">
                    <Icons.Upload size={12} />
                    Enviar imagem
                    <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                  </label>
                </div>
                {form.hero_bg && (
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => setForm({ ...form, hero_bg: '' })} className="text-red-400 text-xs hover:underline flex items-center gap-1">
                      <Icons.Trash size={12} /> Remover fundo
                    </button>
                    <a href={form.hero_bg} target="_blank" rel="noreferrer" className="text-[#a0a0a0] text-xs hover:text-white underline">
                      Abrir imagem
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">COR PRIMÁRIA</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primary_color || '#f5b800'}
                  onChange={e => setForm({ ...form, primary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent border border-[#2a2a2a]" />
                <input value={form.primary_color || '#f5b800'}
                  onChange={e => setForm({ ...form, primary_color: e.target.value })}
                  className="input-dark flex-1" placeholder="#f5b800" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
              <p className="text-[#a0a0a0] text-sm mb-2">Prévia da cor</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: form.primary_color || '#f5b800', color: '#000' }}>Botão Dourado</button>
                <span className="text-sm font-semibold" style={{ color: form.primary_color || '#f5b800' }}>Texto dourado</span>
              </div>
            </div>
            <p className="text-[#a0a0a0] text-xs">Nota: A personalização de cores será refletida após salvar e recarregar a página.</p>
          </>
        )}

        {tab === 'system' && (
          <>
            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] space-y-3">
              <h4 className="text-white font-semibold">Backup do Banco de Dados</h4>
              <p className="text-[#a0a0a0] text-sm">Faça o download de um backup completo dos dados do sistema.</p>
              <button onClick={() => window.open('/api/backup', '_blank')}
                className="btn-gold px-4 py-2 text-sm flex items-center gap-2">
                <Icons.Download size={14} /> Baixar Backup
              </button>
            </div>
            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
              <h4 className="text-white font-semibold mb-2">Informações do Sistema</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Versão</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Banco de Dados</span>
                  <span className="text-white">SQLite (Local)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">APIs Externas</span>
                  <span className="text-green-400">Nenhuma</span>
                </div>
              </div>
            </div>
          </>
        )}

        {tab !== 'system' && (
          <button onClick={handleSave} disabled={saving} className="btn-gold w-full py-3 text-sm">
            {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        )}
      </div>
    </div>
  );
}
