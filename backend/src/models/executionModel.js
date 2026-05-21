const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function getPendingExecutions() {
  return db.prepare(`
    SELECT e.*, c.telefone, c.nome as nome_contato_db
    FROM execucao_fluxo e
    LEFT JOIN contatos c ON e.contato_id = c.id
    WHERE e.status = 'ativo' AND datetime(replace(substr(e.proxima_execucao, 1, 19), 'T', ' ')) <= datetime('now')
    ORDER BY e.proxima_execucao ASC
    LIMIT 20
  `).all();
}

function create({ fluxoId, contatoId, telefone, nomeContato, proximaExecucao }) {
  const id = uuidv4();
  db.prepare('INSERT INTO execucao_fluxo (id, fluxo_id, contato_id, telefone, nome_contato, etapa_atual, status, proxima_execucao) VALUES (?, ?, ?, ?, ?, 0, ?, ?)')
    .run(id, fluxoId, contatoId, telefone, nomeContato || null, 'ativo', proximaExecucao);
  return id;
}

function advance(id, proximaEtapa, proximaExecucao) {
  return db.prepare('UPDATE execucao_fluxo SET etapa_atual = ?, proxima_execucao = ? WHERE id = ?').run(proximaEtapa, proximaExecucao, id);
}

function markComplete(id) {
  return db.prepare("UPDATE execucao_fluxo SET status = 'concluido', finalizado_em = datetime('now') WHERE id = ?").run(id);
}

function markError(id, erro) {
  return db.prepare("UPDATE execucao_fluxo SET status = 'erro', erro = ?, finalizado_em = datetime('now') WHERE id = ?").run(erro, id);
}

function findByFluxo(fluxoId) {
  return db.prepare(`
    SELECT e.*, c.nome as contato_nome
    FROM execucao_fluxo e
    LEFT JOIN contatos c ON e.contato_id = c.id
    WHERE e.fluxo_id = ?
    ORDER BY e.iniciado_em DESC
  `).all(fluxoId);
}

function alreadyEnrolled(fluxoId, contatoId) {
  const existing = db.prepare("SELECT id FROM execucao_fluxo WHERE fluxo_id = ? AND contato_id = ? AND status = 'ativo'").get(fluxoId, contatoId);
  return !!existing;
}

function getStats() {
  return db.prepare(`
    SELECT
      SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluidos,
      SUM(CASE WHEN status = 'erro' THEN 1 ELSE 0 END) as erros,
      COUNT(*) as total
    FROM execucao_fluxo
  `).get();
}

function findAll({ page = 1, limit = 50 } = {}) {
  return db.prepare(`
    SELECT e.*, f.nome as fluxo_nome, c.nome as contato_nome
    FROM execucao_fluxo e
    LEFT JOIN fluxos f ON e.fluxo_id = f.id
    LEFT JOIN contatos c ON e.contato_id = c.id
    ORDER BY e.iniciado_em DESC
    LIMIT ? OFFSET ?
  `).all(limit, (page - 1) * limit);
}

module.exports = { getPendingExecutions, create, advance, markComplete, markError, findByFluxo, alreadyEnrolled, getStats, findAll };
