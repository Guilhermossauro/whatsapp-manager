const express = require('express');
const router = express.Router();
const db = require('../database/db');
const queueModel = require('../models/queueModel');
const executionModel = require('../models/executionModel');

router.get('/', (req, res, next) => {
  try {
    const totalContatos = db.prepare('SELECT COUNT(*) as total FROM contatos').get().total;
    const totalListas = db.prepare('SELECT COUNT(*) as total FROM listas').get().total;
    const totalCampanhas = db.prepare('SELECT COUNT(*) as total FROM campanhas').get().total;
    const totalFluxos = db.prepare('SELECT COUNT(*) as total FROM fluxos').get().total;
    const totalMensagens = db.prepare('SELECT COUNT(*) as total FROM message_logs WHERE status IN (\'sent\', \'mock_sent\')').get().total;
    const campanhasAtivas = db.prepare("SELECT COUNT(*) as total FROM campanhas WHERE status = 'enviando'").get().total;
    const queueStats = queueModel.getStats();
    const execStats = executionModel.getStats();
    const recentLogs = db.prepare('SELECT * FROM message_logs ORDER BY created_at DESC LIMIT 5').all();
    res.json({
      totalContatos,
      totalListas,
      totalCampanhas,
      totalFluxos,
      totalMensagens,
      campanhasAtivas,
      queue: queueStats,
      execucoes: execStats,
      recentLogs
    });
  } catch (err) { next(err); }
});

module.exports = router;
