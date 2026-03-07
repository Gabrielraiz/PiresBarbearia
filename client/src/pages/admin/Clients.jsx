import React, { useEffect, useState } from 'react';
import { Icons } from '../../components/Icons';
import api from '../../api';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => { api.get('/clients').then(r => setClients(r.data)); }, []);

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
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">CLIENTES</h1>
        <p className="text-[#a0a0a0] text-sm">{clients.length} clientes cadastrados</p>
      </div>

      <div className="relative mb-4">
        <Icons.User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-dark pl-9" placeholder="Buscar por nome, email ou telefone..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(c => (
          <div key={c.id} className="card p-4 cursor-pointer hover:border-[rgba(245,184,0,0.3)]"
            onClick={() => handleSelect(c)}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0">
                {c.photo ? (
                  <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold text-lg">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{c.name}</p>
                <p className="text-[#a0a0a0] text-xs truncate">{c.email}</p>
                {c.phone && <p className="text-[#a0a0a0] text-xs">{c.phone}</p>}
              </div>
              <Icons.ChevronRight size={16} className="text-[#a0a0a0] flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Icons.Users size={32} className="text-[#2a2a2a] mx-auto mb-2" />
          <p className="text-[#a0a0a0]">Nenhum cliente encontrado</p>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0 border border-[#f5b800]">
                {selected.photo ? (
                  <img src={selected.photo} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold text-2xl">
                    {selected.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-xl">{selected.name}</h3>
                <p className="text-[#a0a0a0] text-sm">{selected.email}</p>
                {selected.phone && <p className="text-[#a0a0a0] text-sm">{selected.phone}</p>}
                <p className="text-[#a0a0a0] text-xs mt-1">
                  Desde: {new Date(selected.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <h4 className="section-title text-sm text-[#f5b800] mb-3">HISTÓRICO DE AGENDAMENTOS</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {appointments.length === 0 ? (
                <p className="text-[#a0a0a0] text-sm">Nenhum agendamento</p>
              ) : appointments.map(a => (
                <div key={a.id} className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{a.service_name}</span>
                    <span className="text-[#f5b800]">R$ {parseFloat(a.service_price).toFixed(2)}</span>
                  </div>
                  <p className="text-[#a0a0a0] text-xs">{a.date} às {a.time} • {a.barber_name}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="btn-outline w-full py-2.5 text-sm mt-4">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
