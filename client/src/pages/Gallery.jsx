import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';
import api from '../api';

export default function Gallery() {
  const { settings } = useSettings();
  const lang = settings.language === 'en';
  const [media, setMedia] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('gallery');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/media').then(r => setMedia(r.data));
    api.get('/reviews').then(r => setReviews(r.data));
  }, []);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">{lang ? 'GALLERY' : 'GALERIA'}</h1>
        <p className="text-[#a0a0a0] text-sm mt-1">{lang ? 'Our work and client reviews' : 'Nosso trabalho e avaliações dos clientes'}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'gallery', label: lang ? 'Gallery' : 'Galeria' },
          { key: 'reviews', label: lang ? `Reviews (${reviews.length})` : `Avaliações (${reviews.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-[#f5b800] text-black' : 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gallery' && (
        <div>
          {media.length === 0 ? (
            <div className="card p-12 text-center">
              <Icons.Image size={40} className="text-[#2a2a2a] mx-auto mb-3" />
              <p className="text-[#a0a0a0]">{lang ? 'Gallery coming soon' : 'Galeria em breve'}</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {media.map(item => (
                <div key={item.id} className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl"
                  onClick={() => setLightbox(item)}>
                  {item.type === 'video' ? (
                    <div className="relative bg-[#1a1a1a] aspect-square flex items-center justify-center">
                      <Icons.Video size={36} className="text-[#f5b800]" />
                    </div>
                  ) : (
                    <img src={item.filename} alt={item.title || ''} className="w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />
                  )}
                  {(item.title || item.client_name) && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.title && <p className="text-white text-sm font-semibold">{item.title}</p>}
                      {item.client_name && <p className="text-[#a0a0a0] text-xs">{item.client_name}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div>
          {reviews.length > 0 && (
            <div className="card p-4 mb-4 flex items-center gap-4">
              <div className="text-center">
                <p className="font-display font-bold text-4xl text-[#f5b800]">{avgRating}</p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[1,2,3,4,5].map(s => (
                    <Icons.Star key={s} size={14} className={parseFloat(avgRating) >= s ? 'text-[#f5b800]' : 'text-[#2a2a2a]'} filled={parseFloat(avgRating) >= s} />
                  ))}
                </div>
                <p className="text-[#a0a0a0] text-xs mt-1">{reviews.length} {lang ? 'reviews' : 'avaliações'}</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length ? (count / reviews.length * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                      <span className="w-3">{star}</span>
                      <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#f5b800] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-5">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="card p-12 text-center">
              <Icons.Star size={40} className="text-[#2a2a2a] mx-auto mb-3" />
              <p className="text-[#a0a0a0]">{lang ? 'No reviews yet' : 'Nenhuma avaliação ainda'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0">
                      {r.client_photo ? (
                        <img src={r.client_photo} alt={r.client_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold">
                          {r.client_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-white">{r.client_name}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Icons.Star key={s} size={12} className={r.rating >= s ? 'text-[#f5b800]' : 'text-[#2a2a2a]'} filled={r.rating >= s} />
                          ))}
                        </div>
                      </div>
                      {r.service_name && <p className="text-[#f5b800] text-xs mb-1">{r.service_name}</p>}
                      {r.comment && <p className="text-[#a0a0a0] text-sm">{r.comment}</p>}
                      <p className="text-[#444] text-xs mt-2">{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div className="max-w-2xl w-full p-4">
            {lightbox.type === 'video' ? (
              <video src={lightbox.filename} controls className="w-full rounded-xl" />
            ) : (
              <img src={lightbox.filename} alt={lightbox.title} className="w-full rounded-xl" />
            )}
            {(lightbox.title || lightbox.description) && (
              <div className="mt-3 text-center">
                {lightbox.title && <p className="text-white font-semibold">{lightbox.title}</p>}
                {lightbox.client_name && <p className="text-[#f5b800] text-sm">{lightbox.client_name}</p>}
                {lightbox.description && <p className="text-[#a0a0a0] text-sm mt-1">{lightbox.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
