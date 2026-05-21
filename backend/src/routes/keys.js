const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const VALID_PERMISSIONS = ['GET', 'POST', 'DELETE'];

function validatePermissions(perms) {
  if (!perms || perms === 'ALL') return 'GET,POST,DELETE';
  const list = perms.split(',').map(p => p.trim().toUpperCase()).filter(p => VALID_PERMISSIONS.includes(p));
  if (list.length === 0) return 'GET';
  return list.join(',');
}

// GET /api/keys
router.get('/', (req, res, next) => {
  try {
    const keys = db.prepare(
      'SELECT id, nome, chave, permissoes, ativo, created_at FROM api_keys ORDER BY created_at DESC'
    ).all();
    res.json(keys);
  } catch (err) { next(err); }
});

// POST /api/keys
router.post('/', (req, res, next) => {
  try {
    const { nome, permissoes } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    const permsNorm = validatePermissions(permissoes);
    const chave = 'wm-' + uuidv4().replace(/-/g, '');
    const id = uuidv4();

    db.prepare('INSERT INTO api_keys (id, nome, chave, permissoes) VALUES (?, ?, ?, ?)').run(id, nome, chave, permsNorm);
    res.status(201).json(db.prepare('SELECT id, nome, chave, permissoes, ativo, created_at FROM api_keys WHERE id = ?').get(id));
  } catch (err) { next(err); }
});

// PATCH /api/keys/:id — atualizar permissões
router.patch('/:id', (req, res, next) => {
  try {
    const { permissoes } = req.body;
    if (!permissoes) return res.status(400).json({ error: 'permissoes é obrigatório' });
    const permsNorm = validatePermissions(permissoes);
    db.prepare('UPDATE api_keys SET permissoes = ? WHERE id = ?').run(permsNorm, req.params.id);
    const updated = db.prepare('SELECT id, nome, chave, permissoes, ativo, created_at FROM api_keys WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Key não encontrada' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/keys/:id
router.delete('/:id', (req, res, next) => {
  try {
    const key = db.prepare('SELECT id FROM api_keys WHERE id = ?').get(req.params.id);
    if (!key) return res.status(404).json({ error: 'Key não encontrada' });
    db.prepare('DELETE FROM api_keys WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
