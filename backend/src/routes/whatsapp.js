const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// GET /api/whatsapp/status
router.get('/status', async (req, res, next) => {
  try {
    const status = await whatsappService.getStatus();
    res.json(status);
  } catch (err) { next(err); }
});

// POST /api/whatsapp/connect
router.post('/connect', async (req, res, next) => {
  try {
    const result = await whatsappService.connect();
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/whatsapp/qr
router.get('/qr', (req, res, next) => {
  try {
    const qr = whatsappService.getQRCode();
    res.json(qr);
  } catch (err) { next(err); }
});

// POST /api/whatsapp/scan (Mock mode only)
router.post('/scan', async (req, res, next) => {
  try {
    const session = whatsappService.getSession();
    if (session.status !== 'aguardando_scan') {
      return res.status(400).json({ error: 'Não há QR Code ativo para escanear' });
    }
    const result = await whatsappService.simulateScan();
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/whatsapp/disconnect
router.post('/disconnect', async (req, res, next) => {
  try {
    const result = await whatsappService.disconnect();
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/whatsapp/send-test
router.post('/send-test', async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'phone e message são obrigatórios' });
    }
    const result = await whatsappService.sendTest(phone, message);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/whatsapp/logs
router.get('/logs', (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = whatsappService.getLogs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });
    const total = whatsappService.getLogCount();
    res.json({ data: logs, total, page: parseInt(page) || 1, limit: parseInt(limit) || 50 });
  } catch (err) { next(err); }
});

module.exports = router;
