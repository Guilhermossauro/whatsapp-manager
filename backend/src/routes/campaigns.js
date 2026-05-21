const express = require('express');
const router = express.Router();
const campaignModel = require('../models/campaignModel');
const queueModel = require('../models/queueModel');
const campaignService = require('../services/campaignService');

router.get('/', (req, res, next) => {
  try {
    res.json(campaignModel.findAll());
  } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try {
    const campaign = campaignModel.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada' });
    campaign.fila = queueModel.findByCampaign(req.params.id);
    res.json(campaign);
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const { nome, mensagem, delay_min, delay_max, lista_id } = req.body;
    if (!nome || !mensagem) return res.status(400).json({ error: 'nome e mensagem são obrigatórios' });
    const campaign = campaignModel.create({
      nome,
      mensagem,
      delayMin: parseInt(delay_min) || 5,
      delayMax: parseInt(delay_max) || 15,
      listaId: lista_id
    });
    res.status(201).json(campaign);
  } catch (err) { next(err); }
});

router.post('/:id/disparar', (req, res, next) => {
  try {
    const result = campaignService.dispatch(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    campaignModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
