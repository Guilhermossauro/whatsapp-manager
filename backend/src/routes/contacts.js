const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const router = express.Router();
const contactModel = require('../models/contactModel');
const listModel = require('../models/listModel');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', (req, res, next) => {
  try {
    const { lista_id, search, page, limit } = req.query;
    const contacts = contactModel.findAll({ listaId: lista_id, search, page: parseInt(page) || 1, limit: parseInt(limit) || 50 });
    const total = contactModel.countAll({ listaId: lista_id, search });
    res.json({ data: contacts, total, page: parseInt(page) || 1 });
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const { nome, telefone, lista_id } = req.body;
    if (!nome || !telefone) return res.status(400).json({ error: 'nome e telefone são obrigatórios' });
    const contact = contactModel.create({ nome, telefone, listaId: lista_id });
    res.status(201).json(contact);
  } catch (err) { next(err); }
});

router.delete('/:id', (req, res, next) => {
  try {
    contactModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/import/:listaId', upload.single('csv'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo CSV não enviado' });
    const lista = listModel.findById(req.params.listaId);
    if (!lista) return res.status(404).json({ error: 'Lista não encontrada' });
    const content = req.file.buffer.toString('utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true });
    const contacts = records
      .filter(r => r.nome && r.telefone)
      .map(r => ({ nome: r.nome, telefone: r.telefone, lista_id: req.params.listaId }));
    if (contacts.length === 0) return res.status(400).json({ error: 'Nenhum contato válido encontrado no CSV' });
    contactModel.bulkCreate(contacts);
    res.json({ imported: contacts.length, total: records.length });
  } catch (err) { next(err); }
});

module.exports = router;
