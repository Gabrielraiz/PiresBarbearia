import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminClients() {
  const { t, labels } = useSettings();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role_label: 'MEMBRO CLUB', privileges: { can_view_stats: false, is_vip: false } });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadClients(); }, []);

  const loadClients = () => {
    api.get('/clients').then(r => setClients(r.data));
  };

  const openEdit = (c) => {
    let privs = { can_view_stats: false, is_vip: false };
    try {
      privs = c.privileges_json ? JSON.parse(c.privileges_json) : privs;
    } catch {}
    
    setForm({ 
      name: c.name, 
      email: c.email, 
      phone: c.phone || '', 
      role_label: c.role_label || 'MEMBRO CLUB',
      privileges: privs
    });
    setModal(c.id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        privileges_json: JSON.stringify(form.privileges)
      };
      await api.put(`/clients/${modal}`, payload);
      setModal(null);
      loadClients();
    } catch (err) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = async (client) => {
    setSelected(client);
    const { data } = await api.get(`/appointments/admin/all?status=`);
    setAppointments(data.filter(a => a.client_id == client.id || a.client_name === client.name));
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
          {t('BASE DE', 'CLIENTS')} <span className="text-[var(--gold)]">{t('CLIENTES', 'BASE')}</span>
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
          <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
            {clients.length} {t('CLIENTES NO SISTEMA', 'CLIENTS IN SYSTEM')}
          </p>
        </div>
      </div>

      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--gold)] group-focus-within:scale-110 transition-transform">
          <Icons.Search size={20} />
        </div>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl pl-12 pr-6 py-5 text-[var(--text-primary)] focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all outline-none placeholder:text-[var(--text-secondary)]/30 shadow-xl" 
          placeholder={t('Pesquisar por nome, email ou telefone do cliente...', 'Search by name, email or client phone...')} 
        />
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-main)]/50">
                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase">Cliente</th>
                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase">Email</th>
                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase">Telefone</th>
                <th className="p-4 text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="group border-b border-[var(--border)] hover:bg-[var(--gold)]/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] font-black italic shadow-inner">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[var(--text-primary)] tracking-tight uppercase italic">{c.name}</p>
                        <span className="text-[9px] font-black tracking-widest text-[var(--gold)] uppercase italic">{c.role_label || 'MEMBRO CLUB'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">{c.email}</td>
                  <td className="p-4 text-xs font-bold text-[var(--text-primary)]">{c.phone || '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleSelect(c)} className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all">
                        <Icons.Calendar size={16} />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all">
                        <Icons.Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card p-20 text-center border-dashed border-[var(--border)] bg-[var(--bg-card)]/30">
          <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
            <Icons.Users size={40} className="text-[var(--text-secondary)]/20" />
          </div>
          <h4 className="text-[var(--text-primary)] font-bold text-lg uppercase tracking-widest">{t('NENHUM CLIENTE', 'NO CLIENTS')}</h4>
          <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto mt-2 italic">
            {t('Não encontramos nenhum registro para os termos pesquisados.', 'No records were found for the search terms.')}
          </p>
        </div>
      )}

      {/* Modal de Edição */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-1">GESTÃO DE PERFIL</p>
                <h3 className="font-display font-black text-3xl text-[var(--text-primary)] tracking-tighter uppercase italic leading-none">
                  EDITAR <span className="text-[var(--gold)]">CLIENTE</span>
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                <Icons.X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase ml-1">NOME COMPLETO</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-bold" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase ml-1">RÓTULO DE PERFIL (EX: MEMBRO CLUB)</label>
                <input 
                  value={form.role_label} 
                  onChange={e => setForm({ ...form, role_label: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--gold)] border-[var(--gold)]/30 focus:border-[var(--gold)] transition-all outline-none font-black italic tracking-widest uppercase" 
                  placeholder="MEMBRO CLUB"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase ml-1">PRIVILÉGIOS ESPECIAIS</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] cursor-pointer group hover:border-[var(--gold)]/30 transition-all">
                    <span className="text-xs font-black tracking-widest uppercase italic group-hover:text-white transition-colors">VER DADOS DE OUTROS USUÁRIOS</span>
                    <input 
                      type="checkbox" 
                      checked={form.privileges.can_view_stats}
                      onChange={e => setForm({ ...form, privileges: { ...form.privileges, can_view_stats: e.target.checked } })}
                      className="w-5 h-5 rounded border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] cursor-pointer group hover:border-[var(--gold)]/30 transition-all">
                    <span className="text-xs font-black tracking-widest uppercase italic group-hover:text-white transition-colors">STATUS VIP (DESCONTOS)</span>
                    <input 
                      type="checkbox" 
                      checked={form.privileges.is_vip}
                      onChange={e => setForm({ ...form, privileges: { ...form.privileges, is_vip: e.target.checked } })}
                      className="w-5 h-5 rounded border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)]"
                    />
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
                  {saving ? 'SALVANDO...' : 'ATUALIZAR PERFIL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Cliente */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-8 border-b border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)]">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded-3xl bg-[var(--bg-main)] overflow-hidden flex-shrink-0 border-2 border-[var(--gold)] shadow-2xl">
                  {selected.photo ? (
                    <img src={selected.photo} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--gold)] font-black text-4xl">
                      {selected.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="font-display font-black text-3xl text-[var(--text-primary)] tracking-tighter uppercase mb-2">
                    {selected.name}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-bold">
                      <Icons.Mail size={12} className="text-[var(--gold)]" /> {selected.email}
                    </span>
                    {selected.phone && (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-bold">
                        <Icons.Phone size={12} className="text-[var(--gold)]" /> {selected.phone}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)]/40 text-[10px] font-black tracking-widest uppercase mt-4">
                    {t('MEMBRO DESDE', 'MEMBER SINCE')} {new Date(selected.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-white transition-colors">
                  <Icons.X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content - History */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)]">
                  <Icons.History size={18} />
                </div>
                <h4 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight uppercase">{t(`HISTÓRICO DE ${labels.services}`.toUpperCase(), `${labels.services.toUpperCase()} HISTORY`)}</h4>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {appointments.length === 0 ? (
                  <div className="text-center py-10 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] border-dashed">
                    <Icons.Calendar size={32} className="text-[var(--text-secondary)]/20 mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)] text-sm italic">{t('Nenhum agendamento registrado até o momento.', 'No records registered yet.')}</p>
                  </div>
                ) : appointments.map(a => (
                  <div key={a.id} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--gold)]/30 transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--gold)] border border-[var(--border)] group-hover:border-[var(--gold)]/30">
                          <Icons.Scissors size={18} />
                        </div>
                        <div>
                          <p className="text-[var(--text-primary)] font-bold text-sm uppercase tracking-tight">{a.service_name}</p>
                          <p className="text-[var(--text-secondary)] text-[10px] font-medium mt-0.5">
                            {new Date(a.date).toLocaleDateString('pt-BR')} às {a.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          <p className="text-[var(--gold)] font-display font-black text-lg leading-none">
                            <span className="text-[10px] mr-1 opacity-50">R$</span>{parseFloat(a.service_price).toFixed(2)}
                          </p>
                          <span className={`text-[8px] font-black tracking-widest uppercase ${
                            a.status === 'completed' ? 'text-green-500' : 
                            a.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                            {a.status === 'completed' ? 'CONCLUÍDO' : a.status === 'cancelled' ? 'CANCELADO' : 'PENDENTE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-[var(--bg-main)] border-t border-[var(--border)] text-center">
              <button 
                onClick={() => setSelected(null)}
                className="px-8 py-3 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20"
              >
                {t('FECHAR DETALHES', 'CLOSE DETAILS')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
