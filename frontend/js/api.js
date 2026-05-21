const API_BASE = '/api';
const DEFAULT_API_KEY = 'whats-super-secret-key-2024';

function getStoredKey() {
  return localStorage.getItem('wm_api_key') || DEFAULT_API_KEY;
}

const api = {
  async request(method, path, data = null, isFormData = false) {
    const storedKey = getStoredKey();
    const opts = {
      method,
      headers: { 'x-api-key': storedKey }
    };
    if (data && !isFormData) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    } else if (isFormData) {
      opts.body = data;
    }
    const res = await fetch(`${API_BASE}${path}`, opts);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro na requisição');
    return json;
  },
  get: (path) => api.request('GET', path),
  post: (path, data) => api.request('POST', path, data),
  put: (path, data) => api.request('PUT', path, data),
  del: (path) => api.request('DELETE', path),
  upload: (path, formData) => api.request('POST', path, formData, true),

  stats: { get: () => api.get('/stats') },
  contatos: {
    list: (params = {}) => api.get(`/contatos?${new URLSearchParams(params)}`),
    create: (data) => api.post('/contatos', data),
    remove: (id) => api.del(`/contatos/${id}`),
    import: (listaId, formData) => api.upload(`/contatos/import/${listaId}`, formData)
  },
  listas: {
    list: () => api.get('/listas'),
    create: (data) => api.post('/listas', data),
    remove: (id) => api.del(`/listas/${id}`)
  },
  campanhas: {
    list: () => api.get('/campanhas'),
    get: (id) => api.get(`/campanhas/${id}`),
    create: (data) => api.post('/campanhas', data),
    disparar: (id) => api.post(`/campanhas/${id}/disparar`),
    remove: (id) => api.del(`/campanhas/${id}`)
  },
  fluxos: {
    list: () => api.get('/fluxos'),
    get: (id) => api.get(`/fluxos/${id}`),
    create: (data) => api.post('/fluxos', data),
    update: (id, data) => api.put(`/fluxos/${id}`, data),
    remove: (id) => api.del(`/fluxos/${id}`),
    addStep: (id, data) => api.post(`/fluxos/${id}/etapas`, data),
    updateStep: (id, data) => api.put(`/fluxos/etapas/${id}`, data),
    removeStep: (id) => api.del(`/fluxos/etapas/${id}`),
    enrollList: (id, listaId) => api.post(`/fluxos/${id}/adicionar-lista`, { lista_id: listaId }),
    execucoes: (id) => api.get(`/fluxos/${id}/execucoes`)
  },
  whatsapp: {
    status: () => api.get('/whatsapp/status'),
    connect: () => api.post('/whatsapp/connect'),
    scan: () => api.post('/whatsapp/scan'),
    disconnect: () => api.post('/whatsapp/disconnect'),
    sendTest: (phone, message) => api.post('/whatsapp/send-test', { phone, message }),
    logs: (params = {}) => api.get(`/whatsapp/logs?${new URLSearchParams(params)}`)
  },
  fila: { get: () => api.get('/fila') },
  keys: {
    list: (key) => {
      const k = key || getStoredKey();
      return fetch(`${API_BASE}/keys`, { headers: { 'x-api-key': k } }).then(r => r.json());
    },
    create: (nome, permissoes, key) => {
      const k = key || getStoredKey();
      return fetch(`${API_BASE}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': k },
        body: JSON.stringify({ nome, permissoes })
      }).then(r => r.json());
    },
    updatePerms: (id, permissoes, key) => {
      const k = key || getStoredKey();
      return fetch(`${API_BASE}/keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-api-key': k },
        body: JSON.stringify({ permissoes })
      }).then(r => r.json());
    },
    remove: (id, key) => {
      const k = key || getStoredKey();
      return fetch(`${API_BASE}/keys/${id}`, { method: 'DELETE', headers: { 'x-api-key': k } }).then(r => r.json());
    }
  }
};

window.api = api;
