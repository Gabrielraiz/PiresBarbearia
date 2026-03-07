import React, { useEffect, useState } from 'react';
import { Icons } from '../../components/Icons';
import api from '../../api';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get(`/admin/reports?from=${from}&to=${to}`).then(r => setData(r.data));
  }, [from, to]);

  const handleBackup = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/backup`, '_blank');
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title text-3xl text-white">RELATÓRIOS</h1>
        <button onClick={handleBackup} className="btn-outline px-4 py-2 text-sm flex items-center gap-2">
          <Icons.Download size={14} /> Backup
        </button>
      </div>

      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">DE</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input-dark w-auto" />
        </div>
        <div>
          <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">ATÉ</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input-dark w-auto" />
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Agendamentos', value: data.totalAppts, icon: Icons.Calendar, color: 'text-[#f5b800]' },
              { label: 'Concluídos', value: data.completedAppts, icon: Icons.Check, color: 'text-green-400' },
              { label: 'Receita', value: `R$ ${parseFloat(data.revenue).toFixed(2)}`, icon: Icons.BarChart, color: 'text-blue-400' },
              { label: 'Avaliação Média', value: `${parseFloat(data.avgRating).toFixed(1)} ★`, icon: Icons.Star, color: 'text-yellow-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[#a0a0a0] text-xs tracking-wider">{label.toUpperCase()}</p>
                  <Icon size={16} className={color} />
                </div>
                <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="section-title text-sm text-[#f5b800] mb-4">SERVIÇOS MAIS REALIZADOS</h3>
              {data.topServices.length === 0 ? (
                <p className="text-[#a0a0a0] text-sm">Sem dados</p>
              ) : (
                <div className="space-y-3">
                  {data.topServices.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-[#a0a0a0] w-4 text-sm">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{s.name}</span>
                          <span className="text-[#f5b800] font-semibold">{s.count}x</span>
                        </div>
                        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                          <div className="h-full bg-[#f5b800] rounded-full" style={{ width: `${(s.count / data.topServices[0].count * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="section-title text-sm text-[#f5b800] mb-4">CLIENTES FREQUENTES</h3>
              {data.topClients.length === 0 ? (
                <p className="text-[#a0a0a0] text-sm">Sem dados</p>
              ) : (
                <div className="space-y-3">
                  {data.topClients.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#f5b800] font-bold text-sm">
                        {c.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{c.name}</p>
                        <p className="text-[#a0a0a0] text-xs">{c.email}</p>
                      </div>
                      <span className="badge badge-warning">{c.count}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {data.monthlyData.length > 0 && (
              <div className="card p-5 md:col-span-2">
                <h3 className="section-title text-sm text-[#f5b800] mb-4">AGENDAMENTOS POR MÊS</h3>
                <div className="space-y-2">
                  {data.monthlyData.map(m => (
                    <div key={m.month} className="flex items-center gap-3 text-sm">
                      <span className="text-[#a0a0a0] w-20">{m.month}</span>
                      <div className="flex-1 h-6 bg-[#1a1a1a] rounded-lg overflow-hidden relative">
                        <div className="h-full bg-[rgba(245,184,0,0.3)] rounded-lg" style={{ width: `${(m.appointments / Math.max(...data.monthlyData.map(x => x.appointments)) * 100)}%` }} />
                        <div className="h-full bg-[#f5b800] rounded-lg absolute top-0 left-0" style={{ width: `${(m.completed / Math.max(...data.monthlyData.map(x => x.appointments)) * 100)}%` }} />
                      </div>
                      <span className="text-white font-semibold w-6">{m.appointments}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-[#a0a0a0]">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#f5b800] inline-block" /> Concluídos</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[rgba(245,184,0,0.3)] inline-block" /> Total</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
