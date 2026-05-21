const express = require('express');
const router = express.Router();
const flowModel = require('../models/flowModel');
const executionModel = require('../models/executionModel');
const flowService = require('../services/flowService');

router.get('/', (req, res, next) => {
  try {
    res.json(flowModel.findAll());
  } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try {
    const fluxo = flowModel.findByIdWithSteps(req.params.id);
    if (!fluxo) return res.status(404).json({ error: 'Fluxo não encontrado' });
    fluxo.execucoes = executionModel.findByFluxo(req.params.id);
    res.json(fluxo);
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    res.status(201).json(flowModel.create({ nome, descricao }));
  } catch (err) { next(err); }
});

router.put('/:id', (req, res, next) => {
  try {
    const { nome, descricao, ativo } = req.body;
    res.json(flowModel.update(req.params.id, { nome, descricao, ativo }));
  } catch (err) { next(err); }
});

router.delete('/:id', (req, res, next) => {
  try {
    flowModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/etapas', (req, res, next) => {
  try {
    const { ordem, mensagem, delay_minutos } = req.body;
    if (!mensagem) return res.status(400).json({ error: 'mensagem é obrigatória' });
    const fluxo = flowModel.findByIdWithSteps(req.params.id);
    const nextOrdem = ordem !== undefined ? parseInt(ordem) : (fluxo?.etapas?.length || 0);
    const step = flowModel.addStep({ fluxoId: req.params.id, ordem: nextOrdem, mensagem, delayMinutos: parseInt(delay_minutos) || 0 });
    res.status(201).json(step);
  } catch (err) { next(err); }
});

router.put('/etapas/:id', (req, res, next) => {
  try {
    const { mensagem, delay_minutos, ordem } = req.body;
    res.json(flowModel.updateStep(req.params.id, { mensagem, delayMinutos: delay_minutos !== undefined ? parseInt(delay_minutos) : undefined, ordem }));
  } catch (err) { next(err); }
});

router.delete('/etapas/:id', (req, res, next) => {
  try {
    flowModel.removeStep(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/adicionar-lista', (req, res, next) => {
  try {
    const { lista_id } = req.body;
    if (!lista_id) return res.status(400).json({ error: 'lista_id é obrigatório' });
    const result = flowService.enrollList(req.params.id, lista_id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/execucoes', (req, res, next) => {
  try {
    res.json(executionModel.findByFluxo(req.params.id));
  } catch (err) { next(err); }
});

module.exports = router;
