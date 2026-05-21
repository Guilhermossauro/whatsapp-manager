const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Imports WhatsApp Web.js
let Client, LocalAuth, QRCode;

try {
  const wwebjs = require('whatsapp-web.js');
  Client = wwebjs.Client;
  LocalAuth = wwebjs.LocalAuth;
  QRCode = require('qrcode');
} catch (error) {
  console.log('[WhatsApp] Modo MOCK: whatsapp-web.js não encontrado');
}

// Estado global
let client = null;
let connectionStatus = 'disconnected';
let currentPhone = null;
let lastQRCode = null;
const sessionPath = path.join(__dirname, '../../.wh-session');
const MOCK_MODE = process.env.MOCK_MODE !== 'false';

// ============ MODO MOCK (Fallback) ============
const FAKE_QR_SVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOCIvPjxyZWN0IHg9IjI1IiB5PSIyNSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTMwIiB5PSIxMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iOCIvPjxyZWN0IHg9IjE0NSIgeT0iMjUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjgiLz48cmVjdCB4PSIyNSIgeT0iMTQ1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSI4NSIgeT0iMTAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9Ijg1IiB5PSIzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTA1IiB5PSIzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iODUiIHk9IjUwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSI4NSIgeT0iODUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwNSIgeT0iODUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwNSIgeT0iMTA1IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIxMjUiIHk9Ijg1IiB3aWR0aD0iNjUiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIxMjUiIHk9IjEwNSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTQ1IiB5PSIxMDUiIHdpZHRoPSIxMCIgaGVpZ2h0PSI1NSIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjE2NSIgeT0iMTA1IiB3aWR0aD0iMjUiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIxMCIgeT0iODUiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMDUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjMwIiB5PSIxMDUiIHdpZHRoPSI0MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEyNSIgeT0iMTI1IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIxNjUiIHk9IjEyNSIgd2lkdGg9IjI1IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTI1IiB5PSIxNDUiIHdpZHRoPSI3MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEyNSIgeT0iMTY1IiB3aWR0aD0iMTAiIGhlaWdodD0iMjUiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIxNjUiIHk9IjE2NSIgd2lkdGg9IjI1IiBoZWlnaHQ9IjI1IiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMTQ1IiB5PSIxNzUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMjUiIHdpZHRoPSI3MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==`;

// ============ FUNÇÕES AUXILIARES ============

function getSession() {
  return db.prepare('SELECT * FROM whatsapp_session WHERE id = 1').get();
}

function updateSession(data) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  values.push(1);
  db.prepare(`UPDATE whatsapp_session SET ${fields} WHERE id = ?`).run(...values);
}

// ============ REAL WHATSAPP WEB.JS ============

async function initClient() {
  if (client || MOCK_MODE) return client;

  try {
    console.log('[WhatsApp] Inicializando whatsapp-web.js...');
    
    client = new Client({
      auth: new LocalAuth({
        clientId: 'default',
        dataPath: sessionPath
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Event: QR Code gerado
    client.on('qr', async (qr) => {
      console.log('[WhatsApp] QR Code gerado - aguardando scan');
      try {
        lastQRCode = await QRCode.toDataURL(qr);
        connectionStatus = 'aguardando_scan';
        updateSession({ status: connectionStatus, qr_code: lastQRCode });
      } catch (e) {
        console.error('[WhatsApp] Erro ao gerar QR:', e.message);
      }
    });

    // Event: Autenticado
    client.on('authenticated', (session) => {
      console.log('[WhatsApp] Autenticado com sucesso');
      connectionStatus = 'connected';
    });

    // Event: Pronto
    client.on('ready', async () => {
      console.log('[WhatsApp] Cliente pronto!');
      connectionStatus = 'connected';
      lastQRCode = null;
      
      try {
        const info = client.info;
        currentPhone = info.wid._serialized.replace('@c.us', '');
        console.log('[WhatsApp] Conectado como:', currentPhone);
        
        updateSession({
          status: 'connected',
          phone: `+${currentPhone}`,
          connected_at: new Date().toISOString(),
          qr_code: null
        });
      } catch (e) {
        console.error('[WhatsApp] Erro ao obter info:', e.message);
      }
    });

    // Event: Mensagem recebida
    client.on('message', (msg) => {
      console.log('[WhatsApp] Mensagem recebida:', msg.from, msg.body);
      const logId = uuidv4();
      db.prepare('INSERT INTO message_logs (id, phone, nome_contato, message, status, source, source_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(logId, msg.from, 'Entrada', msg.body, 'received', 'incoming', null);
    });

    // Event: Desconectado
    client.on('disconnected', (reason) => {
      console.log('[WhatsApp] Desconectado:', reason);
      connectionStatus = 'disconnected';
      currentPhone = null;
      client = null;
      updateSession({ status: 'disconnected', phone: null, connected_at: null, qr_code: null });
    });

    return client;
  } catch (error) {
    console.error('[WhatsApp] Erro ao inicializar:', error.message);
    return null;
  }
}

// ============ API PÚBLICA ============

async function connect() {
  if (MOCK_MODE) {
    updateSession({ status: 'aguardando_scan', qr_code: FAKE_QR_SVG, phone: null, connected_at: null });
    return getSession();
  }

  try {
    const cli = await initClient();
    if (!cli) throw new Error('Falha ao inicializar cliente');
    
    await cli.initialize();
    return { status: connectionStatus, message: 'Inicializando...' };
  } catch (error) {
    console.error('[WhatsApp] Erro ao conectar:', error.message);
    throw error;
  }
}

function getQRCode() {
  const session = getSession();
  return {
    status: session.status,
    qr_code: session.qr_code,
    timestamp: new Date().toISOString()
  };
}

async function getStatus() {
  const session = getSession();
  
  if (MOCK_MODE) {
    return {
      status: session.status,
      phone: session.phone,
      connected_at: session.connected_at,
      mode: 'mock'
    };
  }

  if (!client || connectionStatus === 'disconnected') {
    return {
      status: 'disconnected',
      phone: null,
      connected_at: null
    };
  }

  return {
    status: connectionStatus,
    phone: currentPhone ? `+${currentPhone}` : null,
    connected_at: connectionStatus === 'connected' ? new Date().toISOString() : null
  };
}

async function sendMessage(phone, message, source = 'campaign', sourceId = null, nomeContato = null) {
  const logId = uuidv4();

  // Modo MOCK
  if (MOCK_MODE) {
    console.log(`[WhatsApp MOCK] ${phone}: ${message}`);
    db.prepare('INSERT INTO message_logs (id, phone, nome_contato, message, status, source, source_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, phone, nomeContato, message, 'mock_sent', source, sourceId);
    return { id: logId, phone, message, status: 'mock_sent' };
  }

  // Modo REAL
  if (!client || connectionStatus !== 'connected') {
    const status = 'queued';
    db.prepare('INSERT INTO message_logs (id, phone, nome_contato, message, status, source, source_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, phone, nomeContato, message, status, source, sourceId);
    throw new Error('WhatsApp não está conectado');
  }

  try {
    // Validar telefone
    if (!phone || !phone.toString().match(/^55\d{10,11}$/)) {
      throw new Error(`Telefone inválido: ${phone}`);
    }

    // Formatar para WhatsApp
    const chatId = `${phone}@c.us`;

    // Enviar
    const result = await client.sendMessage(chatId, message);

    console.log('[WhatsApp] Enviado para:', phone, 'ID:', result.id);

    db.prepare('INSERT INTO message_logs (id, phone, nome_contato, message, status, source, source_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, phone, nomeContato, message, 'sent', source, sourceId);

    return {
      id: logId,
      phone,
      message,
      status: 'sent',
      message_id: result.id
    };
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar:', error.message);
    db.prepare('INSERT INTO message_logs (id, phone, nome_contato, message, status, source, source_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, phone, nomeContato, message, 'error', source, sourceId);
    throw error;
  }
}

async function simulateScan() {
  if (!MOCK_MODE) return null;
  
  updateSession({
    status: 'connected',
    phone: '+55 11 9' + Math.floor(Math.random() * 9000 + 1000) + '-' + Math.floor(Math.random() * 9000 + 1000),
    connected_at: new Date().toISOString(),
    qr_code: null
  });
  return getSession();
}

async function disconnect() {
  if (MOCK_MODE) {
    updateSession({ status: 'disconnected', phone: null, connected_at: null, qr_code: null });
    return { status: 'disconnected' };
  }

  if (!client) {
    return { status: 'already_disconnected' };
  }

  try {
    await client.destroy();
    client = null;
    connectionStatus = 'disconnected';
    currentPhone = null;
    updateSession({ status: 'disconnected', phone: null, connected_at: null, qr_code: null });
    console.log('[WhatsApp] Desconectado');
    return { status: 'disconnected' };
  } catch (error) {
    console.error('[WhatsApp] Erro ao desconectar:', error.message);
    throw error;
  }
}

async function sendTest(phone, message) {
  return await sendMessage(phone, message, 'test', null, 'Teste');
}

function getLogs({ page = 1, limit = 50 } = {}) {
  return db.prepare('SELECT * FROM message_logs ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, (page - 1) * limit);
}

function getLogCount() {
  return db.prepare('SELECT COUNT(*) as total FROM message_logs').get().total;
}

module.exports = {
  getSession,
  connect,
  getQRCode,
  getStatus,
  sendMessage,
  simulateScan,
  disconnect,
  sendTest,
  getLogs,
  getLogCount,
  init: initClient
};
