const db = require('./db');
const { v4: uuidv4 } = require('uuid');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS listas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contatos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      lista_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS campanhas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      delay_min INTEGER NOT NULL DEFAULT 5,
      delay_max INTEGER NOT NULL DEFAULT 15,
      status TEXT DEFAULT 'rascunho',
      lista_id TEXT,
      total_contatos INTEGER DEFAULT 0,
      enviados INTEGER DEFAULT 0,
      erros INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS fila_envio (
      id TEXT PRIMARY KEY,
      campanha_id TEXT NOT NULL,
      contato_id TEXT NOT NULL,
      telefone TEXT NOT NULL,
      nome_contato TEXT,
      mensagem TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      agendado_para TEXT NOT NULL,
      enviado_em TEXT,
      tentativas INTEGER DEFAULT 0,
      erro TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (campanha_id) REFERENCES campanhas(id),
      FOREIGN KEY (contato_id) REFERENCES contatos(id)
    );

    CREATE TABLE IF NOT EXISTS fluxos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fluxo_etapas (
      id TEXT PRIMARY KEY,
      fluxo_id TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      mensagem TEXT NOT NULL,
      delay_minutos INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (fluxo_id) REFERENCES fluxos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS execucao_fluxo (
      id TEXT PRIMARY KEY,
      fluxo_id TEXT NOT NULL,
      contato_id TEXT NOT NULL,
      telefone TEXT NOT NULL,
      nome_contato TEXT,
      etapa_atual INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ativo',
      proxima_execucao TEXT NOT NULL,
      iniciado_em TEXT DEFAULT (datetime('now')),
      finalizado_em TEXT,
      erro TEXT,
      FOREIGN KEY (fluxo_id) REFERENCES fluxos(id),
      FOREIGN KEY (contato_id) REFERENCES contatos(id)
    );

    CREATE TABLE IF NOT EXISTS message_logs (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      nome_contato TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      source TEXT DEFAULT 'campaign',
      source_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      chave TEXT UNIQUE NOT NULL,
      permissoes TEXT DEFAULT 'GET,POST,DELETE',
      ativo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS whatsapp_session (
      id INTEGER PRIMARY KEY DEFAULT 1,
      status TEXT DEFAULT 'disconnected',
      phone TEXT,
      connected_at TEXT,
      qr_code TEXT
    );
  `);

  // Migração: adicionar coluna permissoes se não existir
  try {
    db.exec(`ALTER TABLE api_keys ADD COLUMN permissoes TEXT DEFAULT 'GET,POST,DELETE'`);
  } catch (_) { /* coluna já existe */ }

  const existingKey = db.prepare('SELECT id FROM api_keys WHERE chave = ?').get(process.env.DEFAULT_API_KEY || 'whats-super-secret-key-2024');
  if (!existingKey) {
    db.prepare('INSERT INTO api_keys (id, nome, chave, permissoes) VALUES (?, ?, ?, ?)').run(
      uuidv4(),
      'Chave Padrão',
      process.env.DEFAULT_API_KEY || 'whats-super-secret-key-2024',
      'GET,POST,DELETE'
    );
  }

  const session = db.prepare('SELECT id FROM whatsapp_session WHERE id = 1').get();
  if (!session) {
    db.prepare('INSERT INTO whatsapp_session (id, status) VALUES (1, ?)').run('disconnected');
  }
}

module.exports = { initDatabase };
