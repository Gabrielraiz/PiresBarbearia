import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para fazer upload de mídia para Supabase Storage
export async function uploadMediaToSupabase(file, bucket = 'media') {
  try {
    const filename = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file);

    if (error) throw error;
    
    // Obter URL pública
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Sincronizar dados com Supabase (backup)
export async function backupToSupabase(data, table) {
  try {
    const { error } = await supabase
      .from(table)
      .insert(data);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Backup error:', error);
    throw error;
  }
}

// Buscar dados do Supabase
export async function getFromSupabase(table, query = {}) {
  try {
    let request = supabase.from(table).select('*');
    
    // Aplicar filtros se houver
    if (query.filter) {
      request = request.eq(query.filter.column, query.filter.value);
    }
    
    const { data, error } = await request;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export default supabase;
