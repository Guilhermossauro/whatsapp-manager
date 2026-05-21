const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function findAll({ listaId, search, page = 1, limit = 50 } = {}) {
  let query = `SELECT c.*, l.nome as lista_nome FROM contatos c LEFT JOIN listas l ON c.lista_id = l.id WHERE 1=1`;
  const params = [];
  if (listaId) { query += ' AND c.lista_id = ?'; params.push(listaId); }
  if (search) { query += ' AND (c.nome LIKE ? OR c.telefone LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);
  return db.prepare(query).all(...params);
}

function countAll({ listaId, search } = {}) {
  let query = 'SELECT COUNT(*) as total FROM contatos WHERE 1=1';
  const params = [];
  if (listaId) { query += ' AND lista_id = ?'; params.push(listaId); }
  if (search) { query += ' AND (nome LIKE ? OR telefone LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  return db.prepare(query).get(...params).total;
}

function findById(id) {
  return db.prepare('SELECT * FROM contatos WHERE id = ?').get(id);
}

function create({ nome, telefone, listaId }) {
  const id = uuidv4();
  db.prepare('INSERT INTO contatos (id, nome, telefone, lista_id) VALUES (?, ?, ?, ?)').run(id, nome, telefone, listaId || null);
  return findById(id);
}

function bulkCreate(contacts) {
  const insert = db.prepare('INSERT OR IGNORE INTO contatos (id, nome, telefone, lista_id) VALUES (?, ?, ?, ?)');
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(uuidv4(), item.nome, item.telefone, item.lista_id || null);
    }
  });
  insertMany(contacts);
}

function remove(id) {
  return db.prepare('DELETE FROM contatos WHERE id = ?').run(id);
}

function findByListId(listaId) {
  return db.prepare('SELECT * FROM contatos WHERE lista_id = ?').all(listaId);
}

module.exports = { findAll, countAll, findById, create, bulkCreate, remove, findByListId };
