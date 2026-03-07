import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';
import api from '../api';

export default function Team() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const lang = settings.language === 'en';
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    api.get('/barbers').then(r => setBarbers(r.data));
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">{lang ? 'OUR TEAM' : 'NOSSA EQUIPE'}</h1>
        <p className="text-[#a0a0a0] text-sm mt-1">{lang ? 'Expert barbers at your service' : 'Barbeiros especialistas ao seu serviço'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {barbers.map(b => (
          <div key={b.id} className="card p-6 text-center hover:border-[rgba(245,184,0,0.3)] transition-all">
            <div className="w-24 h-24 rounded-full bg-[#2a2a2a] border-2 border-[#f5b800] overflow-hidden mx-auto mb-4 relative">
              {b.photo ? (
                <img src={b.photo} alt={b.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold text-3xl">
                  {b.name.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-2 border-[#141414]" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-1">{b.name}</h3>
            {b.specialty && (
              <p className="text-[#f5b800] text-sm font-semibold mb-2">{b.specialty}</p>
            )}
            {b.bio && <p className="text-[#a0a0a0] text-sm mb-4">{b.bio}</p>}
            <button onClick={() => navigate(`/booking?barber=${b.id}`)}
              className="btn-gold w-full py-2.5 text-sm">
              {lang ? 'BOOK WITH ME' : 'AGENDAR COMIGO'}
            </button>
          </div>
        ))}
      </div>

      {barbers.length === 0 && (
        <div className="card p-12 text-center">
          <Icons.Users size={40} className="text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#a0a0a0]">{lang ? 'Team info coming soon' : 'Informações da equipe em breve'}</p>
        </div>
      )}
    </div>
  );
}
