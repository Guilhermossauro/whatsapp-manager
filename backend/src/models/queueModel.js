const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

function getPendingMessages() {
  return db.prepare(`
    SELECT f.*, c.telefone as contato_telefone
    FROM fila_envio f
    LEFT JOIN contatos c ON f.contato_id = c.id
    WHERE f.status = 'pendente' AND datetime(replace(substr(f.agendado_para, 1, 19), 'T', ' ')) <= datetime('now')
    ORDER BY f.agendado_para ASC
    LIMIT 10
  `).all();
}

function create({ campanhaId, contatoId, telefone, nomeContato, mensagem, agendadoPara }) {
  const id = uuidv4();
  db.prepare('INSERT INTO fila_envio (id, campanha_id, contato_id, telefone, nome_contato, mensagem, agendado_para) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, campanhaId, contatoId, telefone, nomeContato || null, mensagem, agendadoPara);
  return id;
}

function bulkCreate(items) {
  const insert = db.prepare('INSERT INTO fila_envio (id, campanha_id, contato_id, telefone, nome_contato, mensagem, agendado_para) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const tx = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(uuidv4(), row.campanha_id, row.contato_id, row.telefone, row.nome_contato, row.mensagem, row.agendado_para);
    }
  });
  tx(items);
}

function updateStatus(id, status, enviadoEm = null) {
  return db.prepare('UPDATE fila_envio SET status = ?, enviado_em = ?, tentativas = tentativas + 1 WHERE id = ?').run(status, enviadoEm, id);
}

function updateStatusWithError(id, status, erro) {
  return db.prepare('UPDATE fila_envio SET status = ?, erro = ?, tentativas = tentativas + 1 WHERE id = ?').run(status, erro, id);
}

function findByCampaign(campanhaId) {
  return db.prepare('SELECT * FROM fila_envio WHERE campanha_id = ? ORDER BY agendado_para ASC').all(campanhaId);
}

function getStats() {
  return db.prepare(`
    SELECT
      SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
      SUM(CASE WHEN status = 'enviado' THEN 1 ELSE 0 END) as enviados,
      SUM(CASE WHEN status = 'erro' THEN 1 ELSE 0 END) as erros,
      SUM(CASE WHEN status = 'processando' THEN 1 ELSE 0 END) as processando,
      COUNT(*) as total
    FROM fila_envio
  `).get();
}

module.exports = { getPendingMessages, create, bulkCreate, updateStatus, updateStatusWithError, findByCampaign, getStats };
