import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import api from '../../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    confirmed: { label: 'Confirmado', className: 'badge-success' },
    pending: { label: 'Pendente', className: 'badge-warning' },
    cancelled: { label: 'Cancelado', className: 'badge-danger' },
    completed: { label: 'Concluído', className: 'badge-info' },
  };

  const stats = data ? [
    { label: 'Agendamentos Hoje', value: data.todayAppts, icon: Icons.Calendar, color: 'text-[#f5b800]' },
    { label: 'Pendentes', value: data.pendingAppts, icon: Icons.Clock, color: 'text-yellow-400' },
    { label: 'Total Clientes', value: data.totalClients, icon: Icons.Users, color: 'text-blue-400' },
    { label: 'Receita do Mês', value: `R$ ${parseFloat(data.monthRevenue).toFixed(2)}`, icon: Icons.BarChart, color: 'text-green-400' },
  ] : [];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">DASHBOARD</h1>
        <p className="text-[#a0a0a0] text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-24 loading-shimmer rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#a0a0a0] text-xs tracking-wider">{label.toUpperCase()}</p>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="section-title text-lg text-white mb-4">PRÓXIMOS AGENDAMENTOS</h2>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 loading-shimmer rounded-xl" />)}
          </div>
        ) : data?.recentAppts?.length === 0 ? (
          <div className="card p-8 text-center">
            <Icons.Calendar size={32} className="text-[#2a2a2a] mx-auto mb-2" />
            <p className="text-[#a0a0a0]">Nenhum agendamento</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.recentAppts?.map(appt => {
              const sc = statusConfig[appt.status] || statusConfig.pending;
              return (
                <div key={appt.id} className="card p-3 flex items-center gap-3 hover:border-[rgba(245,184,0,0.2)]">
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#f5b800] font-bold flex-shrink-0">
                    {appt.client_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{appt.client_name}</p>
                    <p className="text-[#a0a0a0] text-xs">{appt.service_name} • {appt.barber_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-semibold">{appt.time}</p>
                    <p className="text-[#a0a0a0] text-xs">{appt.date}</p>
                  </div>
                  <span className={`badge ${sc.className} flex-shrink-0`}>{sc.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { icon: Icons.Calendar, label: 'Agenda', to: '/admin/schedule' },
          { icon: Icons.Users, label: 'Clientes', to: '/admin/clients' },
          { icon: Icons.User, label: 'Barbeiros', to: '/admin/barbers' },
          { icon: Icons.Settings, label: 'Configurações', to: '/admin/settings' },
        ].map(({ icon: Icon, label, to }) => (
          <button key={to} onClick={() => navigate(to)}
            className="card p-4 flex flex-col items-center gap-2 hover:border-[rgba(245,184,0,0.3)]">
            <Icon size={22} className="text-[#f5b800]" />
            <span className="text-xs text-[#a0a0a0] font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
