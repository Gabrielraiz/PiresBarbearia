import React, { useEffect, useState, useRef } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', client_name: '' });
  const fileRef = useRef();

  useEffect(() => { loadMedia(); }, []);

  const loadMedia = () => api.get('/media').then(r => setMedia(r.data));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', uploadForm.title);
    fd.append('description', uploadForm.description);
    fd.append('client_name', uploadForm.client_name);
    try {
      await api.post('/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadForm({ title: '', description: '', client_name: '' });
      loadMedia();
    } catch (err) {
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover esta mídia?')) return;
    await api.delete(`/media/${id}`);
    loadMedia();
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-[var(--bg-main)]">
      <div className="mb-8">
        <h1 className="font-display font-black text-4xl md:text-5xl text-[var(--text-primary)] tracking-tighter mb-2">
          GALERIA <span className="text-[var(--gold)]">PREMIUM</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-[var(--gold)] rounded-full" />
          <p className="text-[var(--text-secondary)] font-medium tracking-widest text-xs uppercase">
            {media.length} ITENS NO PORTFÓLIO
          </p>
        </div>
      </div>

      <div className="card p-6 mb-8 border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)]">
            <Icons.Upload size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight">NOVA MÍDIA</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { key: 'title', label: 'TÍTULO DA OBRA', placeholder: 'Ex: Degradê Navalhado', icon: <Icons.Type size={14} /> },
            { key: 'client_name', label: 'CLIENTE', placeholder: 'Nome do cliente', icon: <Icons.User size={14} /> },
            { key: 'description', label: 'DESCRIÇÃO', placeholder: 'Detalhes do serviço...', icon: <Icons.FileText size={14} /> },
          ].map(({ key, label, placeholder, icon }) => (
            <div key={key} className="space-y-2">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                {icon} {label}
              </label>
              <input 
                value={uploadForm[key]} 
                onChange={e => setUploadForm({ ...uploadForm, [key]: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all outline-none placeholder:text-[var(--text-secondary)]/30" 
                placeholder={placeholder} 
              />
            </div>
          ))}
        </div>

        <label className={`group relative flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/[0.02] transition-all duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          
          <div className="w-16 h-16 rounded-full bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center group-hover:scale-110 group-hover:border-[var(--gold)] transition-all duration-500">
            {uploading ? (
              <Icons.RefreshCw size={28} className="text-[var(--gold)] animate-spin" />
            ) : (
              <Icons.Image size={28} className="text-[var(--text-secondary)] group-hover:text-[var(--gold)]" />
            )}
          </div>

          <div className="text-center">
            <p className="text-[var(--text-primary)] font-bold text-sm tracking-tight">
              {uploading ? 'ENVIANDO ARQUIVO...' : 'CLIQUE PARA SELECIONAR'}
            </p>
            <p className="text-[var(--text-secondary)] text-xs mt-1">
              FOTOS OU VÍDEOS ATÉ 50MB
            </p>
          </div>
        </label>
      </div>

      {media.length === 0 ? (
        <div className="card p-20 text-center border-dashed border-[var(--border)]">
          <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
            <Icons.Image size={40} className="text-[var(--text-secondary)]/20" />
          </div>
          <h4 className="text-[var(--text-primary)] font-bold text-lg">GALERIA VAZIA</h4>
          <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto mt-2">
            Comece a subir fotos dos seus melhores cortes para atrair mais clientes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map(item => (
            <div key={item.id} className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-xl">
              {item.type === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-main)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] mb-2">
                    <Icons.Video size={24} />
                  </div>
                  <span className="text-[var(--text-secondary)] text-[10px] font-bold tracking-widest uppercase">VÍDEO</span>
                </div>
              ) : (
                <img src={item.filename} alt={item.title || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="p-2 rounded-xl bg-red-500/80 text-white hover:bg-red-600 transition-colors backdrop-blur-md"
                    title="Excluir"
                  >
                    <Icons.Trash size={16} />
                  </button>
                </div>

                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {item.client_name && (
                    <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.2em] uppercase mb-1">
                      {item.client_name}
                    </p>
                  )}
                  {item.title && (
                    <p className="text-white text-sm font-bold leading-tight">
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
  );
}
