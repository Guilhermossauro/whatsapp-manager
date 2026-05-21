const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function findAll() {
  return db.prepare(`
    SELECT f.*, COUNT(e.id) as total_etapas,
    (SELECT COUNT(*) FROM execucao_fluxo WHERE fluxo_id = f.id AND status = 'ativo') as execucoes_ativas,
    (SELECT COUNT(*) FROM execucao_fluxo WHERE fluxo_id = f.id AND status = 'concluido') as execucoes_concluidas
    FROM fluxos f
    LEFT JOIN fluxo_etapas e ON e.fluxo_id = f.id
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `).all();
}

function findById(id) {
  return db.prepare('SELECT * FROM fluxos WHERE id = ?').get(id);
}

function findByIdWithSteps(id) {
  const fluxo = db.prepare('SELECT * FROM fluxos WHERE id = ?').get(id);
  if (!fluxo) return null;
  fluxo.etapas = db.prepare('SELECT * FROM fluxo_etapas WHERE fluxo_id = ? ORDER BY ordem ASC').all(id);
  return fluxo;
}

function create({ nome, descricao }) {
  const id = uuidv4();
  db.prepare('INSERT INTO fluxos (id, nome, descricao) VALUES (?, ?, ?)').run(id, nome, descricao || null);
  return findById(id);
}

function update(id, { nome, descricao, ativo }) {
  const fields = [];
  const params = [];
  if (nome !== undefined) { fields.push('nome = ?'); params.push(nome); }
  if (descricao !== undefined) { fields.push('descricao = ?'); params.push(descricao); }
  if (ativo !== undefined) { fields.push('ativo = ?'); params.push(ativo ? 1 : 0); }
  if (fields.length === 0) return findById(id);
  params.push(id);
  db.prepare(`UPDATE fluxos SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return findById(id);
}

function remove(id) {
  return db.prepare('DELETE FROM fluxos WHERE id = ?').run(id);
}

function addStep({ fluxoId, ordem, mensagem, delayMinutos }) {
  const id = uuidv4();
  db.prepare('INSERT INTO fluxo_etapas (id, fluxo_id, ordem, mensagem, delay_minutos) VALUES (?, ?, ?, ?, ?)')
    .run(id, fluxoId, ordem, mensagem, delayMinutos || 0);
  return db.prepare('SELECT * FROM fluxo_etapas WHERE id = ?').get(id);
}

function updateStep(id, { mensagem, delayMinutos, ordem }) {
  const fields = [];
  const params = [];
  if (mensagem !== undefined) { fields.push('mensagem = ?'); params.push(mensagem); }
  if (delayMinutos !== undefined) { fields.push('delay_minutos = ?'); params.push(delayMinutos); }
  if (ordem !== undefined) { fields.push('ordem = ?'); params.push(ordem); }
  if (fields.length === 0) return;
  params.push(id);
  db.prepare(`UPDATE fluxo_etapas SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return db.prepare('SELECT * FROM fluxo_etapas WHERE id = ?').get(id);
}

function removeStep(id) {
  return db.prepare('DELETE FROM fluxo_etapas WHERE id = ?').run(id);
}

function getStepByOrder(fluxoId, ordem) {
  return db.prepare('SELECT * FROM fluxo_etapas WHERE fluxo_id = ? AND ordem = ?').get(fluxoId, ordem);
}

function getStepCount(fluxoId) {
  return db.prepare('SELECT COUNT(*) as total FROM fluxo_etapas WHERE fluxo_id = ?').get(fluxoId).total;
}

module.exports = { findAll, findById, findByIdWithSteps, create, update, remove, addStep, updateStep, removeStep, getStepByOrder, getStepCount };
