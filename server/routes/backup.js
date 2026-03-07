const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const {
  backupDatabase,
  uploadMedia,
  listBackups,
  restoreBackup,
  cleanOldBackups,
} = require('../integrations/supabase');

// Fazer backup automático
router.post('/backup', authenticateAdmin, async (req, res) => {
  try {
    const result = await backupDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listar backups disponíveis
router.get('/backups', authenticateAdmin, async (req, res) => {
  try {
    const backups = await listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restaurar um backup
router.post('/restore/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const backupData = await restoreBackup(filename);
    
    // TODO: Implementar lógica de restauração no banco de dados local
    res.json({ 
      message: 'Backup carregado com sucesso',
      data: backupData 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Limpar backups antigos
router.post('/clean-backups', authenticateAdmin, async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    const result = await cleanOldBackups(daysToKeep);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
