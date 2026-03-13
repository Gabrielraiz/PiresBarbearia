import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export default function Footer() {
  const { settings, t } = useSettings();
  const navigate = useNavigate();
  const holdRef = useRef(null);

  const startHold = () => {
    holdRef.current = setTimeout(() => {
      navigate('/admin/login');
    }, 2000);
  };

  const cancelHold = () => {
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };

  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border)] py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          &copy; {new Date().getFullYear()} {settings.site_name || 'PiresQK'}. {t('Todos os direitos reservados.', 'All rights reserved.')}
        </p>
        <p className="text-xs text-[var(--text-secondary)]/50 mt-2">
          {t('Desenvolvido por', 'Developed by')} <span onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold} onTouchStart={startHold} onTouchEnd={cancelHold} className="font-bold text-[var(--gold)] hover:underline cursor-pointer">Gabriel Oliveira da Rocha</span>
        </p>
      </div>
    </footer>
  );
}
