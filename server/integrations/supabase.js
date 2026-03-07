const { createClient } = require('@supabase/supabase-js');
const { getDb } = require('../database');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.VITE_SUPABASE_ANON_KEY
);

// Backup automático para Supabase
async function backupDatabase() {
  try {
    const db = getDb();
    const tables = [
      'users',
      'barbers',
      'services',
      'appointments',
      'reviews',
      'media',
      'settings',
      'business_hours',
      'barber_schedules',
      'notifications',
    ];

    const backup = {
      timestamp: new Date().toISOString(),
      data: {},
    };

    // Exportar todos os dados
    for (const table of tables) {
      try {
        const records = db.prepare(`SELECT * FROM ${table}`).all();
        backup.data[table] = records;
      } catch (error) {
        console.error(`Erro ao exportar ${table}:`, error);
      }
    }

    // Fazer upload para Supabase Storage
    const filename = `backup_${new Date().toISOString().split('T')[0]}.json`;
    const { data, error } = await supabase.storage
      .from('backups')
      .upload(filename, JSON.stringify(backup), {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) throw error;
    return { success: true, filename };
  } catch (error) {
    console.error('Backup error:', error);
    throw error;
  }
}

// Upload de mídia para Supabase Storage
async function uploadMedia(file, mediaType = 'images') {
  try {
    const filename = `${Date.now()}_${file.originalname}`;
    const { data, error } = await supabase.storage
      .from(mediaType)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Obter URL pública
    const { data: publicUrl } = supabase.storage
      .from(mediaType)
      .getPublicUrl(filename);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Media upload error:', error);
    throw error;
  }
}

// Listar backups
async function listBackups() {
  try {
    const { data, error } = await supabase.storage.from('backups').list();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('List backups error:', error);
    throw error;
  }
}

// Restaurar backup
async function restoreBackup(filename) {
  try {
    const { data, error: downloadError } = await supabase.storage
      .from('backups')
      .download(filename);

    if (downloadError) throw downloadError;

    const backupData = JSON.parse(await data.text());
    return backupData;
  } catch (error) {
    console.error('Restore backup error:', error);
    throw error;
  }
}

// Limpar backups antigos (manter apenas últimos 30 dias)
async function cleanOldBackups(daysToKeep = 30) {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('backups')
      .list();

    if (listError) throw listError;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filesToDelete = files
      .filter(file => new Date(file.created_at) < cutoffDate)
      .map(file => file.name);

    if (filesToDelete.length > 0) {
      await supabase.storage.from('backups').remove(filesToDelete);
    }

    return { success: true, deletedFiles: filesToDelete.length };
  } catch (error) {
    console.error('Clean backups error:', error);
    throw error;
  }
}

module.exports = {
  backupDatabase,
  uploadMedia,
  listBackups,
  restoreBackup,
  cleanOldBackups,
};
