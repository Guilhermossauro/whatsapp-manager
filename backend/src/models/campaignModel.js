const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function findAll() {
  return db.prepare(`
    SELECT c.*, l.nome as lista_nome
    FROM campanhas c
    LEFT JOIN listas l ON c.lista_id = l.id
    ORDER BY c.created_at DESC
  `).all();
}

function findById(id) {
  return db.prepare(`
    SELECT c.*, l.nome as lista_nome
    FROM campanhas c
    LEFT JOIN listas l ON c.lista_id = l.id
    WHERE c.id = ?
  `).get(id);
}

function create({ nome, mensagem, delayMin, delayMax, listaId }) {
  const id = uuidv4();
  db.prepare('INSERT INTO campanhas (id, nome, mensagem, delay_min, delay_max, lista_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, nome, mensagem, delayMin, delayMax, listaId || null);
  return findById(id);
}

function updateStatus(id, status) {
  return db.prepare('UPDATE campanhas SET status = ? WHERE id = ?').run(status, id);
}

function updateCounters(id, { totalContatos, enviados, erros }) {
  if (totalContatos !== undefined) db.prepare('UPDATE campanhas SET total_contatos = ? WHERE id = ?').run(totalContatos, id);
  if (enviados !== undefined) db.prepare('UPDATE campanhas SET enviados = enviados + ? WHERE id = ?').run(enviados, id);
  if (erros !== undefined) db.prepare('UPDATE campanhas SET erros = erros + ? WHERE id = ?').run(erros, id);
}

function remove(id) {
  return db.prepare('DELETE FROM campanhas WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, updateStatus, updateCounters, remove };
