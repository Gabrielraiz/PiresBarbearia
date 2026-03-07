import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    site_name: 'PiresQK Barbearia',
    site_tagline: 'Transformando visual em identidade. Onde cada corte é uma obra de arte.',
    phone: '(49) 99918-3044',
    whatsapp: '5549999183044',
    address: 'Rua das Flores, 123 - Centro',
    instagram: 'https://instagram.com/piresqkcortes',
    facebook: 'https://facebook.com/piresqkbarbearia',
    primary_color: '#f5b800',
    language: 'pt',
  });

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const refreshSettings = () => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
