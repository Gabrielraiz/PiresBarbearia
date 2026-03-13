import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { fetchWithCache, invalidateCache } from '../lib/requestCache';
import { getApiErrorMessage } from '../lib/apiError';
import { BUSINESS_LABELS } from '../lib/universalDictionary';

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
    language: localStorage.getItem('language') || 'pt',
    theme: localStorage.getItem('theme') || 'dark',
    hero_bg: '',
    site_logo: '',
    map_embed_url: '',
    payments_enabled: '0',
    payments_allow_cart: '0',
    payment_provider: 'mercadopago',
    stripe_public_key: '',
    feature_booking: '1',
    feature_services: '1',
    feature_team: '1',
    feature_gallery: '1',
    feature_contact: '1',
    feature_map: '1',
    feature_whatsapp: '1',
    feature_reviews: '1',
  });

  useEffect(() => {
    fetchWithCache('settings:global', async () => {
      const response = await api.get('/settings');
      return response.data;
    }, 60000).then((cachedSettings) => {
      const localLang = localStorage.getItem('language');
      const data = { ...settings, ...cachedSettings };
      if (localLang) data.language = localLang;
      setSettings(data);
      const currentTheme = data.theme || localStorage.getItem('theme') || 'dark';
      document.documentElement.className = currentTheme;
      document.documentElement.lang = data.language === 'en' ? 'en' : 'pt-BR';
      localStorage.setItem('theme', currentTheme);
      if (data.primary_color) {
        document.documentElement.style.setProperty('--gold', data.primary_color);
      }
    }).catch(err => {
      console.error(getApiErrorMessage(err, 'Erro ao carregar configurações do servidor'));
    });
  }, []);

  const refreshSettings = () => {
    invalidateCache('settings:');
    fetchWithCache('settings:global', async () => {
      const response = await api.get('/settings');
      return response.data;
    }, 0).then((data) => {
      setSettings(prev => ({ ...prev, ...data }));
      const currentTheme = data.theme || localStorage.getItem('theme') || 'dark';
      document.documentElement.className = currentTheme;
      document.documentElement.lang = data.language === 'en' ? 'en' : 'pt-BR';
      localStorage.setItem('theme', currentTheme);
      if (data.primary_color) {
        document.documentElement.style.setProperty('--gold', data.primary_color);
      }
    }).catch(err => {
      console.error(getApiErrorMessage(err, 'Erro ao atualizar configurações'));
    });
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings(prev => ({ ...prev, theme: newTheme }));
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
    api.put('/settings', { theme: newTheme }).catch(err => {
      console.error(getApiErrorMessage(err, 'Erro ao sincronizar tema com o servidor'));
    });
  };

  const setLanguage = (lang) => {
    setSettings(prev => ({ ...prev, language: lang }));
    const langCode = lang === 'pt' ? 'pt-BR' : lang;
    document.documentElement.lang = langCode;
    localStorage.setItem('language', lang);
  };

  const t = (pt, en, es, fr, de, it) => {
    const lang = settings.language;
    if (lang === 'en') return en || pt;
    if (lang === 'es') return es || pt;
    if (lang === 'fr') return fr || pt;
    if (lang === 'de') return de || pt;
    if (lang === 'it') return it || pt;
    return pt;
  };
  const labels = BUSINESS_LABELS[settings.language] || BUSINESS_LABELS['pt'];

  // Override specific settings with translations if available
  const translatedSettings = {
    ...settings,
    site_tagline: labels.tagline || settings.site_tagline,
    site_name: settings.site_name?.includes('Barbearia') 
      ? settings.site_name.replace('Barbearia', labels.industry.charAt(0).toUpperCase() + labels.industry.slice(1))
      : settings.site_name,
  };

  const modules = {
    booking: true,
    services: true,
    team: true,
    gallery: true,
    contact: true,
    reviews: true,
  };

  return (
    <SettingsContext.Provider value={{ settings: translatedSettings, rawSettings: settings, setSettings, refreshSettings, toggleTheme, setLanguage, t, labels, modules }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
