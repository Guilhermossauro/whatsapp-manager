const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function findAll() {
  return db.prepare(`
    SELECT l.*, COUNT(c.id) as total_contatos
    FROM listas l
    LEFT JOIN contatos c ON c.lista_id = l.id
    GROUP BY l.id
    ORDER BY l.created_at DESC
  `).all();
}

function findById(id) {
  return db.prepare('SELECT * FROM listas WHERE id = ?').get(id);
}

function create({ nome }) {
  const id = uuidv4();
  db.prepare('INSERT INTO listas (id, nome) VALUES (?, ?)').run(id, nome);
  return findById(id);
}

function remove(id) {
  return db.prepare('DELETE FROM listas WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, remove };
