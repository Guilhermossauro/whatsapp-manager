const express = require('express');
const router = express.Router();
const queueModel = require('../models/queueModel');
const executionModel = require('../models/executionModel');

router.get('/', (req, res, next) => {
  try {
    const queueStats = queueModel.getStats();
    const execStats = executionModel.getStats();
    const execucoes = executionModel.findAll({ page: parseInt(req.query.page) || 1 });
    res.json({ queue: queueStats, execucoes: execStats, items: execucoes });
  } catch (err) { next(err); }
});

module.exports = router;
