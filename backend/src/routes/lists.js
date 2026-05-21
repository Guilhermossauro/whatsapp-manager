const express = require('express');
const router = express.Router();
const listModel = require('../models/listModel');

router.get('/', (req, res, next) => {
  try {
    const lists = listModel.findAll();
    res.json(lists);
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    const list = listModel.create({ nome });
    res.status(201).json(list);
  } catch (err) { next(err); }
});

router.delete('/:id', (req, res, next) => {
  try {
    listModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
