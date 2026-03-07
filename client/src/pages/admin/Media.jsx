import React, { useEffect, useState, useRef } from 'react';
import { Icons } from '../../components/Icons';
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
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">GALERIA</h1>
        <p className="text-[#a0a0a0] text-sm">{media.length} itens</p>
      </div>

      <div className="card p-5 mb-6">
        <h3 className="section-title text-sm text-[#f5b800] mb-4">UPLOAD DE MÍDIA</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {[
            { key: 'title', label: 'TÍTULO', placeholder: 'Título da foto/vídeo' },
            { key: 'client_name', label: 'NOME DO CLIENTE', placeholder: 'Nome do cliente' },
            { key: 'description', label: 'DESCRIÇÃO', placeholder: 'Descrição' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">{label}</label>
              <input value={uploadForm[key]} onChange={e => setUploadForm({ ...uploadForm, [key]: e.target.value })}
                className="input-dark text-sm" placeholder={placeholder} />
            </div>
          ))}
        </div>
        <label className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed border-[#2a2a2a] rounded-xl cursor-pointer hover:border-[#f5b800] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          {uploading ? (
            <>
              <Icons.RefreshCw size={20} className="text-[#f5b800] animate-spin" />
              <span className="text-[#a0a0a0]">Enviando...</span>
            </>
          ) : (
            <>
              <Icons.Upload size={20} className="text-[#f5b800]" />
              <span className="text-[#a0a0a0]">Clique para selecionar foto ou vídeo</span>
            </>
          )}
        </label>
      </div>

      {media.length === 0 ? (
        <div className="card p-12 text-center">
          <Icons.Image size={40} className="text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#a0a0a0]">Nenhuma mídia na galeria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map(item => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[rgba(245,184,0,0.3)] transition-all">
              {item.type === 'video' ? (
                <div className="aspect-square flex items-center justify-center">
                  <Icons.Video size={36} className="text-[#f5b800]" />
                </div>
              ) : (
                <img src={item.filename} alt={item.title || ''} className="w-full aspect-square object-cover" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <button onClick={() => handleDelete(item.id)} className="self-end p-1.5 rounded-lg bg-[rgba(239,68,68,0.8)] text-white">
                  <Icons.Trash size={14} />
                </button>
                <div>
                  {item.title && <p className="text-white text-xs font-semibold truncate">{item.title}</p>}
                  {item.client_name && <p className="text-[#f5b800] text-xs truncate">{item.client_name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
