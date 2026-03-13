import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../../components/Icons';
import useContentPage from '../../features/pages/useContentPage';
import { useSettings } from '../../contexts/SettingsContext';

export default function AboutModulePage() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const { loading, page } = useContentPage('about');
  const sections = page?.body || [];
  const title = t(page?.title_pt || 'Sobre nós', page?.title_en || 'About us', page?.title_es || 'Sobre nosotros');
  const lead = t(page?.lead_pt || '', page?.lead_en || '', page?.lead_es || '');
  const ctaPrimaryLabel = t(page?.cta_primary_label_pt || 'Saiba mais', page?.cta_primary_label_en || 'Learn more', page?.cta_primary_label_es || 'Saber más');
  const ctaSecondaryLabel = t(page?.cta_secondary_label_pt || 'Ver detalhes', page?.cta_secondary_label_en || 'See details', page?.cta_secondary_label_es || 'Ver detalles');
  const ctaPrimaryTo = page?.cta_primary_to || '/contact';
  const ctaSecondaryTo = page?.cta_secondary_to || '/services';
  return (
    <div className="min-h-screen p-4 md:p-12 bg-[var(--bg-main)]">
      <div className="max-w-6xl mx-auto">
        <div className="card p-8 md:p-12 mb-8 bg-[var(--bg-card)] border-[var(--border)]">
          <h1 className="page-title text-5xl text-[var(--text-primary)] mb-4">{title}</h1>
          <p className="text-[var(--text-secondary)] mb-8">{lead}</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => navigate(ctaPrimaryTo)} className="btn-gold px-6 py-3 text-xs font-black">{ctaPrimaryLabel}</button>
            <button onClick={() => navigate(ctaSecondaryTo)} className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] text-xs font-black">{ctaSecondaryLabel}</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(loading ? [1, 2, 3, 4] : sections).map((item, idx) => (
            <div key={item?.id || idx} className="card p-6 bg-[var(--bg-card)] border-[var(--border)]">
              <div className="flex items-center gap-3 mb-3"><Icons.CheckCircle size={18} className="text-[var(--gold)]" /><p className="text-[var(--text-primary)] font-bold">{loading ? 'Carregando...' : (t(item.title_pt, item.title_en, item.title_es))}</p></div>
              <p className="text-[var(--text-secondary)] text-sm">{loading ? '' : (t(item.description_pt, item.description_en, item.description_es))}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
