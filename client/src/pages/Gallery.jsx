import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Icons from '../components/Icons';
import api from '../api';
import PageSkeleton from '../components/PageSkeleton';
import { fetchWithCache } from '../lib/requestCache';
import { getApiErrorMessage } from '../lib/apiError';

export default function Gallery() {
  const { settings } = useSettings();
  const lang = settings.language === 'en';
  const [media, setMedia] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('gallery');
  const [lightbox, setLightbox] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchWithCache('gallery:media', async () => {
        const response = await api.get('/media');
        return response.data;
      }, 45000),
      fetchWithCache('gallery:reviews', async () => {
        const response = await api.get('/reviews');
        return response.data;
      }, 45000),
    ])
      .then(([mediaData, reviewsData]) => {
        if (!active) return;
        setMedia(mediaData);
        setReviews(reviewsData);
      })
      .catch((err) => setErrorMessage(getApiErrorMessage(err, 'Não foi possível carregar a galeria.')))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!lightbox) {
      setComments([]);
      return;
    }
    setCommentsLoading(true);
    let active = true;
    fetchWithCache(`gallery:comments:${lightbox.id}`, async () => {
      const response = await api.get(`/media/${lightbox.id}/comments`);
      return response.data;
    }, 10000).then((commentsData) => {
      if (active) setComments(commentsData);
    }).catch((err) => {
      if (active) setErrorMessage(getApiErrorMessage(err, 'Não foi possível carregar os comentários.'));
    }).finally(() => {
      if (active) setCommentsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [lightbox]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/media/${lightbox.id}/comments`, { comment: newComment });
      setComments([data, ...comments]);
      setNewComment('');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Falha ao publicar comentário.'));
    }
  };

  const handleLike = async (mediaId) => {
    try {
      const response = await api.post(`/media/${mediaId}/like`);
      setMedia(currentMedia => 
        currentMedia.map(item => {
          if (item.id === mediaId) {
            return {
              ...item,
              likes: item.likes + (response.data.liked ? 1 : -1),
              user_liked: response.data.liked ? 1 : 0,
            };
          }
          return item;
        })
      );
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Falha ao registrar curtida.'));
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
          NOSSA <span className="text-[var(--gold)]">GALERIA</span>
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
          <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
            {lang ? 'PORTFOLIO & REVIEWS' : 'PORTFÓLIO E AVALIAÇÕES'}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
          <Icons.AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-10 justify-center md:justify-start">
        {[
          { key: 'gallery', label: lang ? 'Gallery' : 'Portfólio', icon: <Icons.Image size={18} /> },
          { key: 'reviews', label: lang ? `Reviews (${reviews.length})` : `Avaliações (${reviews.length})`, icon: <Icons.Star size={18} /> },
        ].map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all duration-300 ${
              tab === t.key 
                ? 'bg-[var(--gold)] text-black shadow-[0_10px_20px_rgba(245,184,0,0.3)] scale-105' 
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--gold)]/50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gallery' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {loading ? (
            <PageSkeleton cards={8} minHeight="min-h-[220px]" />
          ) : media.length === 0 ? (
            <div className="card p-20 text-center border-dashed border-[var(--border)]">
              <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
                <Icons.Image size={40} className="text-[var(--text-secondary)]/20" />
              </div>
              <h4 className="text-[var(--text-primary)] font-bold text-lg uppercase tracking-widest">
                {lang ? 'GALLERY COMING SOON' : 'GALERIA EM BREVE'}
              </h4>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {media.map(item => (
                <div 
                  key={item.id} 
                  className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-xl"
                  onClick={() => setLightbox(item)}
                >
                  {item.type === 'video' ? (
                    <div className="relative aspect-square flex flex-col items-center justify-center bg-[var(--bg-main)] group-hover:scale-105 transition-transform duration-700">
                      <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] mb-3">
                        <Icons.Video size={32} />
                      </div>
                      <span className="text-[var(--text-secondary)] text-[10px] font-bold tracking-widest uppercase">VÍDEO</span>
                    </div>
                  ) : (
                    <img 
                      src={item.filename} 
                      alt={item.title || ''} 
                      loading="lazy"
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  )}
                  
                  {/* Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 flex flex-col justify-between">
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
                      className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-lg ${item.user_liked ? 'bg-[var(--gold)] text-black' : 'bg-black/50 text-white'}`}>
                      <Icons.Heart size={14} fill={item.user_liked ? 'currentColor' : 'none'} />
                      <span>{item.likes}</span>
                    </div>
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {item.client_name && (
                        <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.2em] uppercase mb-1">
                          {item.client_name}
                        </p>
                      )}
                      {item.title && (
                        <p className="text-white text-lg font-bold leading-tight">
                          {item.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            {/* Stats Card */}
            <div className="lg:col-span-1 card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-main)]">
              <p className="font-display font-black text-6xl text-[var(--gold)] mb-2">{avgRating}</p>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Icons.Star 
                    key={s} 
                    size={20} 
                    className={parseFloat(avgRating) >= s ? 'text-[var(--gold)]' : 'text-[var(--border)]'} 
                    fill={parseFloat(avgRating) >= s ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <p className="text-[var(--text-secondary)] font-bold tracking-widest text-[10px] uppercase">
                {reviews.length} {lang ? 'TOTAL REVIEWS' : 'AVALIAÇÕES TOTAIS'}
              </p>
            </div>

            {/* Bars Card */}
            <div className="lg:col-span-3 card p-8 grid gap-4">
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-10">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{star}</span>
                      <Icons.Star size={12} className="text-[var(--gold)]" fill="currentColor" />
                    </div>
                    <div className="flex-1 h-2 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div 
                        className="h-full bg-[var(--gold)] rounded-full transition-all duration-1000 delay-300" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <span className="w-8 text-xs font-medium text-[var(--text-secondary)] text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="card p-20 text-center border-dashed border-[var(--border)]">
              <Icons.Star size={40} className="text-[var(--text-secondary)]/20 mx-auto mb-6" />
              <h4 className="text-[var(--text-primary)] font-bold text-lg uppercase tracking-widest">
                {lang ? 'NO REVIEWS YET' : 'NENHUMA AVALIAÇÃO AINDA'}
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(r => (
                <div key={r.id} className="card p-6 group hover:border-[var(--gold)]/50 transition-all duration-500">
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-[var(--bg-main)] overflow-hidden flex-shrink-0 border border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-colors">
                      {r.client_photo ? (
                        <img src={r.client_photo} alt={r.client_name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--gold)] font-black text-xl">
                          {r.client_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-[var(--text-primary)] text-lg leading-tight">{r.client_name}</p>
                          {r.service_name && (
                            <p className="text-[var(--gold)] text-[10px] font-black tracking-widest uppercase mt-1">
                              {r.service_name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Icons.Star 
                              key={s} 
                              size={14} 
                              className={r.rating >= s ? 'text-[var(--gold)]' : 'text-[var(--border)]'} 
                              fill={r.rating >= s ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-[var(--text-secondary)] text-sm italic leading-relaxed">
                          "{r.comment}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-4 text-[var(--text-secondary)]/40 text-[10px] font-bold tracking-widest uppercase">
                        <Icons.Clock size={10} />
                        {new Date(r.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lightbox && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setLightbox(null)}
        >
          <div className="w-full max-w-6xl h-[90vh] bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-2/3 bg-[var(--bg-main)] flex items-center justify-center min-h-[40vh] md:min-h-0">
              {lightbox.type === 'video' ? (
                <video src={lightbox.filename} controls autoPlay className="max-w-full max-h-full" />
              ) : (
                <img src={lightbox.filename} alt={lightbox.title || ''} className="max-w-full max-h-full object-contain" />
              )}
            </div>
            <div className="w-full md:w-1/3 flex flex-col">
              <div className="p-6 border-b border-[var(--border)]">
                <p className="text-[var(--gold)] text-xs font-black tracking-widest uppercase mb-1">{lightbox.client_name || 'PiresQK'}</p>
                <h3 className="text-white font-bold text-xl">{lightbox.title || 'Detalhes'}</h3>
              </div>
              <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                {commentsLoading && (
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-[var(--bg-main)] animate-pulse" />
                    <div className="h-12 rounded-xl bg-[var(--bg-main)] animate-pulse" />
                  </div>
                )}
                {comments.map(c => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-main)] overflow-hidden flex-shrink-0">
                      {c.user_photo ? (
                        <img src={c.user_photo} alt={c.user_name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--gold)] font-bold">{c.user_name?.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{c.user_name}</p>
                      <p className="text-[var(--text-secondary)] text-sm">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[var(--bg-main)]/50 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="input-dark flex-1 !rounded-xl"
                  />
                  <button onClick={handlePostComment} className="w-12 h-12 rounded-xl bg-[var(--gold)] text-black flex items-center justify-center hover:bg-white transition-all">
                    <Icons.Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
