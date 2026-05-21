const db = require('../database/db');

// Mapeia método HTTP para permissão (PUT e PATCH usam permissão POST)
function methodToPermission(method) {
  if (method === 'GET' || method === 'HEAD') return 'GET';
  if (method === 'DELETE') return 'DELETE';
  return 'POST'; // POST, PUT, PATCH
}

function apiAuth(req, res, next) {
  const key = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!key) return res.status(401).json({ error: 'API Key não fornecida', hint: 'Adicione o header: x-api-key: sua-chave' });

  const found = db.prepare('SELECT id, permissoes FROM api_keys WHERE chave = ? AND ativo = 1').get(key);
  if (!found) return res.status(403).json({ error: 'API Key inválida ou inativa' });

  const required = methodToPermission(req.method);
  const allowed  = (found.permissoes || 'GET,POST,DELETE').split(',').map(p => p.trim().toUpperCase());

  if (!allowed.includes(required)) {
    return res.status(403).json({
      error: `Esta API Key não tem permissão para ${req.method}`,
      permissoes_da_chave: allowed,
      requerido: required
    });
  }

  req.apiKeyId = found.id;
  next();
}

module.exports = apiAuth;
