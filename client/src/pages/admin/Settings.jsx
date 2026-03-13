import React, { useEffect, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Icons from '../../components/Icons';
import api from '../../api';
import { getApiErrorMessage } from '../../lib/apiError';

export default function AdminSettings() {
  const { settings: ctxSettings, refreshSettings, t, labels } = useSettings();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('general');
  const [saveError, setSaveError] = useState('');

  const handleBackupDownload = async () => {
    try {
      const response = await api.get('/admin/backup/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.db`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, t('Falha ao baixar backup do banco.', 'Failed to download database backup.')));
    }
  };

  useEffect(() => { setForm({ ...ctxSettings }); }, [ctxSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await api.put('/settings', form);
      // Se o tema mudou no formulário, aplicar imediatamente
      if (form.theme) {
        document.documentElement.className = form.theme;
        localStorage.setItem('theme', form.theme);
      }
      // Se a cor mudou no formulário, aplicar imediatamente
      if (form.primary_color) {
        document.documentElement.style.setProperty('--gold', form.primary_color);
      }
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, t('Erro ao salvar configurações.', 'Error saving settings.')));
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
      alert(t('Erro ao enviar imagem de fundo', 'Error uploading background image'));
    }
  };

  const toggleFeature = (key) => {
    setForm({ ...form, [key]: form[key] === '1' ? '0' : '1' });
  };

  const tabs = [
    { key: 'general', label: t('Geral', 'General', 'General', 'Général', 'Allgemein', 'Generale'), icon: Icons.Settings },
    { key: 'business', label: t('Negócio', 'Business', 'Negocio', 'Entreprise', 'Unternehmen', 'Affari'), icon: Icons.Package },
    { key: 'contact', label: t('Contato', 'Contact', 'Contacto', 'Contact', 'Kontakt', 'Contatto'), icon: Icons.Phone },
    { key: 'appearance', label: t('Aparência', 'Appearance', 'Apariencia', 'Apparence', 'Aussehen', 'Aspetto'), icon: Icons.Palette },
    { key: 'payments', label: t('Pagamentos', 'Payments', 'Pagos', 'Paiements', 'Zahlungen', 'Pagamenti'), icon: Icons.DollarSign },
    { key: 'system', label: t('Sistema', 'System', 'Sistema', 'Système', 'System', 'Sistema'), icon: Icons.Shield },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
            {t('CONFIGURAÇÕES', 'SYSTEM', 'AJUSTES', 'PARAMÈTRES', 'SYSTEM', 'IMPOSTAZIONI')} <span className="text-[var(--gold)]">{t('DO SISTEMA', 'SETTINGS', 'DEL SISTEMA', 'DU SYSTÈME', 'EINSTELLUNGEN', 'DEL SISTEMA')}</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
            <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
              {t('AJUSTES GERAIS, CONTATO E APARÊNCIA', 'GENERAL SETTINGS, CONTACT AND APPEARANCE', 'AJUSTES GENERALES, CONTACTO Y APARIENCIA')}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="group flex items-center justify-center gap-3 px-10 py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <Icons.RefreshCw size={18} className="animate-spin" />
          ) : (
            <Icons.Save size={18} className="group-hover:scale-110 transition-transform" />
          )}
          {saving ? t('SALVANDO...', 'SAVING...') : labels.save?.toUpperCase()}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-10 justify-center md:justify-start">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button 
            key={key} 
            onClick={() => setTab(key)}
            className={`flex items-center gap-3 px-6 py-4 text-xs font-black tracking-widest uppercase rounded-2xl transition-all duration-300 ${
              tab === key 
                ? 'bg-[var(--gold)] text-black shadow-xl shadow-[var(--gold)]/20 scale-105' 
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--gold)]/50'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500 mb-8">
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
              <Icons.Check size={18} />
            </div>
            CONFIGURAÇÕES ATUALIZADAS COM SUCESSO!
          </div>
        </div>
      )}
      {saveError && (
        <div className="animate-in fade-in duration-300 mb-8">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3 shadow-lg">
            <Icons.AlertCircle size={18} />
            {saveError}
          </div>
        </div>
      )}

      <div className="card p-8 md:p-10 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        {tab === 'general' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                  <Icons.Type size={14} /> {t('NOME DO ESTABELECIMENTO', 'BUSINESS NAME', 'NOMBRE DEL NEGOCIO')}
                </label>
                <input 
                  value={form.site_name || ''} 
                  onChange={e => setForm({ ...form, site_name: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-bold" 
                  placeholder="Ex: PiresQK Barbearia" 
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                  <Icons.Clock size={14} /> {t('INTERVALO DE AGENDAMENTO', 'BOOKING INTERVAL', 'INTERVALO DE CITA')}
                </label>
                <select 
                  value={form.appointment_interval || '30'} 
                  onChange={e => setForm({ ...form, appointment_interval: e.target.value })} 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none appearance-none cursor-pointer font-bold"
                >
                  <option value="15">15 {t('MINUTOS', 'MINUTES', 'MINUTOS')}</option>
                  <option value="30">30 {t('MINUTOS', 'MINUTES', 'MINUTOS')}</option>
                  <option value="45">45 {t('MINUTOS', 'MINUTES', 'MINUTOS')}</option>
                  <option value="60">1 {t('HORA', 'HOUR', 'HORA')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                <Icons.FileText size={14} /> {t('SLOGAN / TAGLINE', 'SLOGAN / TAGLINE', 'ESLOGAN / TAGLINE')}
              </label>
              <textarea 
                value={form.site_tagline || ''} 
                onChange={e => setForm({ ...form, site_tagline: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none h-28 resize-none text-sm italic font-medium" 
                placeholder={t('Ex: Onde o estilo encontra a perfeição...', 'Ex: Where style meets perfection...', 'Ex: Donde el estilo encuentra la perfección...')} 
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                <Icons.Globe size={14} /> {t('IDIOMA DO SISTEMA', 'SYSTEM LANGUAGE', 'IDIOMA DEL SISTEMA')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { id: 'pt', label: 'PORTUGUÊS', flag: '🇧🇷' },
                  { id: 'en', label: 'ENGLISH', flag: '🇺🇸' },
                  { id: 'es', label: 'ESPAÑOL', flag: '🇪🇸' },
                  { id: 'fr', label: 'FRANÇAIS', flag: '🇫🇷' },
                  { id: 'de', label: 'DEUTSCH', flag: '🇩🇪' },
                  { id: 'it', label: 'ITALIANO', flag: '🇮🇹' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setForm({ ...form, language: lang.id })}
                    className={`flex items-center justify-center gap-3 py-4 rounded-xl border transition-all font-black text-[10px] tracking-widest ${
                      form.language === lang.id 
                        ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]' 
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/30'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { key: 'phone', label: t('TELEFONE COMERCIAL', 'BUSINESS PHONE', 'TELÉFONO COMERCIAL'), icon: <Icons.Phone size={14} />, placeholder: '(49) 99918-3044' },
              { key: 'whatsapp', label: t('WHATSAPP (C/ DDI)', 'WHATSAPP (W/ COUNTRY CODE)', 'WHATSAPP (C/ DDI)'), icon: <Icons.MessageCircle size={14} />, placeholder: '5549999183044' },
              { key: 'address', label: t('ENDEREÇO COMPLETO', 'FULL ADDRESS', 'DIRECCIÓN COMPLETA'), icon: <Icons.MapPin size={14} />, placeholder: 'Rua das Flores, 123 - Centro' },
              { key: 'instagram', label: t('INSTAGRAM (URL)', 'INSTAGRAM (URL)', 'INSTAGRAM (URL)'), icon: <Icons.Instagram size={14} />, placeholder: 'https://instagram.com/perfil' },
              { key: 'facebook', label: t('FACEBOOK (URL)', 'FACEBOOK (URL)', 'FACEBOOK (URL)'), icon: <Icons.Facebook size={14} />, placeholder: 'https://facebook.com/pagina' },
              { key: 'map_embed_url', label: t('MAPA (EMBED URL)', 'MAP (EMBED URL)', 'MAPA (EMBED URL)'), icon: <Icons.Map size={14} />, placeholder: 'https://www.google.com/maps/embed?pb=...' },
            ].map(({ key, label, icon, placeholder }) => (
              <div key={key} className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                  {icon} {label}
                </label>
                <input 
                  value={form[key] || ''} 
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-bold" 
                  placeholder={placeholder} 
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'appearance' && (
          <div className="space-y-12">
            {/* Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-6 w-1 bg-[var(--gold)] rounded-full" />
                <h3 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase italic">{t('IDENTIDADE VISUAL', 'VISUAL IDENTITY', 'IDENTIDAD VISUAL')}</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Logo */}
                <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] group">
                  <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase mb-6">{t('LOGOTIPO DA MARCA', 'BRAND LOGO', 'LOGOTIPO DE LA MARCA')}</p>
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative w-40 h-40 rounded-3xl bg-[var(--bg-card)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden group/logo cursor-pointer hover:border-[var(--gold)]/50 transition-all duration-500">
                      {form.site_logo ? (
                        <img src={form.site_logo} alt="Logo" className="w-full h-full object-contain p-4 group-hover/logo:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center text-[var(--text-secondary)] group-hover/logo:text-[var(--gold)] transition-colors">
                          <Icons.Image size={48} />
                          <span className="text-[10px] mt-3 font-black tracking-widest uppercase">{t('UP LOGO', 'UP LOGO', 'SUBIR LOGO')}</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center cursor-pointer transition-all backdrop-blur-sm">
                        <Icons.Camera size={32} className="text-white transform scale-90 group-hover/logo:scale-100 transition-transform duration-300" />
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mb-4">{t('RECOMENDADO: PNG TRANSPARENTE OU SVG', 'RECOMMENDED: TRANSPARENT PNG OR SVG', 'RECOMENDADO: PNG TRANSPARENTE O SVG')}</p>
                      {form.site_logo && (
                        <button 
                          onClick={() => setForm({ ...form, site_logo: '' })} 
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all mx-auto"
                        >
                          <Icons.Trash size={12} /> {t('REMOVER LOGO', 'REMOVE LOGO', 'ELIMINAR LOGO')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero Background */}
                <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)]">
                  <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase mb-6">{t('IMAGEM DE FUNDO PRINCIPAL', 'MAIN BACKGROUND IMAGE', 'IMAGEN DE FONDO PRINCIPAL')}</p>
                  <div className="relative w-full rounded-2xl overflow-hidden aspect-video bg-[var(--bg-card)] border-2 border-dashed border-[var(--border)] group/bg cursor-pointer hover:border-[var(--gold)]/50 transition-all duration-500 shadow-inner">
                    {form.hero_bg ? (
                      <>
                        <img src={form.hero_bg} alt="Fundo" className="absolute inset-0 w-full h-full object-cover group-hover/bg:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] group-hover/bg:text-[var(--gold)] transition-colors">
                        <Icons.Layout size={48} />
                        <span className="text-[10px] mt-3 font-black tracking-widest uppercase">{t('FUNDO HERO', 'HERO BACKGROUND', 'FONDO HERO')}</span>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bg:opacity-100 bg-black/40 transition-all cursor-pointer backdrop-blur-sm">
                      <div className="bg-[var(--gold)] text-black px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center gap-3 transform translate-y-4 group-hover/bg:translate-y-0 transition-all duration-500 shadow-2xl">
                        <Icons.Upload size={18} /> {t('ENVIAR IMAGEM', 'UPLOAD IMAGE', 'SUBIR IMAGEN')}
                      </div>
                      <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                    </label>
                  </div>
                  {form.hero_bg && (
                    <div className="mt-6 flex items-center justify-between">
                      <button 
                        onClick={() => setForm({ ...form, hero_bg: '' })} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Icons.Trash size={12} /> {t('REMOVER FUNDO', 'REMOVE BACKGROUND', 'ELIMINAR FONDO')}
                      </button>
                      <a href={form.hero_bg} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] text-[10px] font-black tracking-widest uppercase hover:text-[var(--gold)] underline transition-colors">{t('VER ORIGINAL', 'VIEW ORIGINAL', 'VER ORIGINAL')}</a>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Theme & Palette */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-1 bg-[var(--gold)] rounded-full" />
                  <h3 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase italic">MODO DO SISTEMA</h3>
                </div>
                <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] grid grid-cols-2 gap-4">
                  {['dark', 'light'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setForm({ ...form, theme: t })}
                      className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 transition-all duration-300 ${
                        form.theme === t 
                          ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)] shadow-xl shadow-[var(--gold)]/10' 
                          : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/30'
                      }`}
                    >
                      {t === 'dark' ? <Icons.Moon size={28} /> : <Icons.Sun size={28} />}
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase">{t === 'dark' ? 'MODO DARK' : 'MODO LIGHT'}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-1 bg-[var(--gold)] rounded-full" />
                  <h3 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase italic">COR DE DESTAQUE</h3>
                </div>
                <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--border)] shadow-2xl">
                      <input 
                        type="color" 
                        value={form.primary_color || '#f5b800'}
                        onChange={e => setForm({ ...form, primary_color: e.target.value })}
                        className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer bg-transparent border-none" 
                      />
                    </div>
                    <div className="flex-1 relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gold)] font-black text-lg">#</div>
                      <input 
                        value={form.primary_color?.replace('#', '') || 'f5b800'}
                        onChange={e => setForm({ ...form, primary_color: `#${e.target.value.replace('#', '')}` })}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl pl-10 pr-6 py-5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-mono text-lg font-black uppercase tracking-widest" 
                        placeholder="F5B800" 
                      />
                    </div>
                  </div>
                  
                  {/* Preview Area */}
                  <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]/50 shadow-inner">
                    <p className="text-[var(--text-secondary)] text-[8px] font-black tracking-widest uppercase mb-4">PREVISÃO DE APLICAÇÃO</p>
                    <div className="flex flex-wrap gap-6 items-center">
                      <button 
                        className="px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl transition-all" 
                        style={{ background: form.primary_color || '#f5b800', color: '#000' }}
                      >
                        BOTÃO TESTE
                      </button>
                      <span className="text-sm font-black italic tracking-tighter" style={{ color: form.primary_color || '#f5b800' }}>
                        TEXTO EM DESTAQUE
                      </span>
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all" 
                        style={{ borderColor: form.primary_color || '#f5b800', color: form.primary_color || '#f5b800' }}
                      >
                        <Icons.Scissors size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium flex items-start gap-4 leading-relaxed shadow-lg shadow-blue-500/5">
              <Icons.Info size={20} className="shrink-0 mt-0.5 text-blue-500" />
              <p className="italic">
                As alterações de aparência são globais. Logos em formato <span className="font-black">PNG Transparente</span> ou <span className="font-black">SVG</span> garantem o acabamento premium esperado para o site. O sistema sincroniza as cores instantaneamente em todos os componentes.
              </p>
            </div>
          </div>
        )}

        {tab === 'business' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-6">
              <p className="text-[var(--text-primary)] font-black text-sm tracking-widest uppercase">MÓDULOS ATIVÁVEIS</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'feature_services', label: 'Serviços' },
                  { key: 'feature_booking', label: 'Agendamento' },
                  { key: 'feature_team', label: 'Equipe' },
                  { key: 'feature_gallery', label: 'Galeria' },
                  { key: 'feature_contact', label: 'Contato' },
                  { key: 'feature_map', label: 'Mapa' },
                  { key: 'feature_whatsapp', label: 'WhatsApp' },
                  { key: 'feature_reviews', label: 'Avaliações' },
                ].map((feature) => (
                  <button
                    key={feature.key}
                    onClick={() => toggleFeature(feature.key)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      form[feature.key] === '1' || form[feature.key] === undefined
                        ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                        : 'border-[var(--border)] bg-[var(--bg-main)]'
                    }`}
                  >
                    <p className="text-[var(--text-primary)] font-black text-xs tracking-widest uppercase mb-2">{feature.label}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{form[feature.key] === '0' ? 'Desativado' : 'Ativado'}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setForm({ ...form, payments_enabled: form.payments_enabled === '1' ? '0' : '1' })}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  form.payments_enabled === '1'
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                    : 'border-[var(--border)] bg-[var(--bg-main)]'
                }`}
              >
                <p className="text-[var(--text-primary)] font-black text-sm tracking-widest uppercase mb-2">Pagamento no Site</p>
                <p className="text-[var(--text-secondary)] text-xs">{form.payments_enabled === '1' ? 'Ativado' : 'Desativado'}</p>
              </button>
              <button
                onClick={() => setForm({ ...form, payments_allow_cart: form.payments_allow_cart === '1' ? '0' : '1' })}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  form.payments_allow_cart === '1'
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                    : 'border-[var(--border)] bg-[var(--bg-main)]'
                }`}
              >
                <p className="text-[var(--text-primary)] font-black text-sm tracking-widest uppercase mb-2">Checkout por Carrinho</p>
                <p className="text-[var(--text-secondary)] text-xs">{form.payments_allow_cart === '1' ? 'Ativado' : 'Desativado'}</p>
              </button>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                  <Icons.DollarSign size={14} /> PROVEDOR PADRÃO
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setForm({ ...form, payment_provider: 'mercadopago' })}
                    className={`py-3 rounded-xl border text-[10px] font-black tracking-widest uppercase ${
                      (form.payment_provider || 'mercadopago') === 'mercadopago'
                        ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10'
                        : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Mercado Pago
                  </button>
                  <button
                    onClick={() => setForm({ ...form, payment_provider: 'stripe' })}
                    className={`py-3 rounded-xl border text-[10px] font-black tracking-widest uppercase ${
                      form.payment_provider === 'stripe'
                        ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10'
                        : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Stripe
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                  <Icons.Lock size={14} /> MERCADO PAGO ACCESS TOKEN
                </label>
                <input
                  value={form.mercadopago_access_token || ''}
                  onChange={e => setForm({ ...form, mercadopago_access_token: e.target.value })}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none text-xs"
                  placeholder="APP_USR-..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                    <Icons.Lock size={14} /> STRIPE SECRET KEY
                  </label>
                  <input
                    value={form.stripe_secret_key || ''}
                    onChange={e => setForm({ ...form, stripe_secret_key: e.target.value })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none text-xs"
                    placeholder="sk_live_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                    <Icons.Lock size={14} /> STRIPE PUBLIC KEY
                  </label>
                  <input
                    value={form.stripe_public_key || ''}
                    onChange={e => setForm({ ...form, stripe_public_key: e.target.value })}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none text-xs"
                    placeholder="pk_live_..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Backup */}
              <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-6 group hover:border-[var(--gold)]/30 transition-all duration-500 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <Icons.Database size={24} />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase">BACKUP INTEGRAL</h4>
                    <p className="text-[var(--text-secondary)] text-xs font-medium">Download completo do banco de dados (SQLite)</p>
                  </div>
                </div>
                <button 
                  onClick={handleBackupDownload}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] font-black text-xs tracking-widest uppercase hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] transition-all shadow-lg active:scale-95"
                >
                  <Icons.Download size={18} /> INICIAR DOWNLOAD
                </button>
              </div>

              {/* System Info */}
              <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)]">
                    <Icons.Server size={24} />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase">INFRAESTRUTURA</h4>
                    <p className="text-[var(--text-secondary)] text-xs font-medium">Informações técnicas da plataforma</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'VERSÃO DO CORE', value: '2.4.0-PREMIUM' },
                    { label: 'MOTOR DE BANCO', value: 'SQLITE 3 / SQL.JS' },
                    { label: 'AMBIENTE', value: 'PRODUCTION' },
                    { label: 'UPTIME', value: '99.9%' }
                  ].map(info => (
                    <div key={info.label} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]/50">
                      <span className="text-[var(--text-secondary)] text-[10px] font-black tracking-widest uppercase">{info.label}</span>
                      <span className="text-[var(--text-primary)] text-[10px] font-bold font-mono">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Logs/Security Placeholder */}
            <div className="p-10 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] text-center shadow-xl">
              <Icons.ShieldCheck size={48} className="text-[var(--gold)] mx-auto mb-6 opacity-20" />
              <h4 className="text-[var(--text-primary)] font-black text-lg uppercase tracking-widest mb-2">SEGURANÇA ATIVA</h4>
              <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto italic">
                O sistema de monitoramento está operando normalmente. Todos os acessos administrativos são criptografados e registrados em logs de segurança.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
