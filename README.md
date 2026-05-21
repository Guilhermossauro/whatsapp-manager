# WhatsApp Manager - Sistema Integrado de Campanhas e Fluxos

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-blue)](https://www.sqlite.org/)
[![WhatsApp Web.js](https://img.shields.io/badge/WhatsApp-web.js-25D366)](https://github.com/pedrosans/whatsapp-web.js)

Um sistema full-stack modular para gerenciar campanhas de WhatsApp em massa, fluxos de automação sequencial e integração direta com a API do WhatsApp Web. Arquitetura com worker assíncrono independente, persistência em banco de dados SQLite e interface moderna com glassmorphism.

## 🎯 Características Principais

- ✅ **Campanhas em Massa** - Disparo de mensagens personalizadas com delay configurável
- ✅ **Fluxos Sequenciais** - Automação de mensagens por etapas com delays entre envios
- ✅ **Fila Assíncrona** - Worker contínuo processando envios sem bloqueio HTTP
- ✅ **Gerenciamento de Contatos** - Importação CSV, listas, organização
- ✅ **Integração WhatsApp Real** - Conexão via WhatsApp Web.js com QR Code
- ✅ **API REST Completa** - Endpoints para todas as operações
- ✅ **API Keys** - Autenticação para integração externa
- ✅ **Interface Dark Mode** - UI glassmorphism com animações fluidas
- ✅ **Mock Mode** - Ambiente de desenvolvimento sem WhatsApp real
- ✅ **Logs de Atividade** - Rastreamento completo de envios

## 📋 Requisitos

- **Node.js** v14.0+ 
- **npm** v6.0+
- **SQLite3** (incluído automaticamente)
- **Navegador moderno** para interface web
- **Conta WhatsApp** (para integração real)

## 🚀 Instalação Rápida

### 1. Clonar repositório

```bash
git clone <seu-repositorio>
cd whats
```

### 2. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend já está incluído nos arquivos estáticos
```

### 3. Configurar variáveis de ambiente

Crie arquivo `.env` na pasta `backend/`:

```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./whatsapp_manager.db
MOCK_MODE=true
LOG_LEVEL=debug
```

**Variáveis disponíveis:**
- `NODE_ENV`: `development` | `production`
- `PORT`: Porta do servidor (padrão: 3001)
- `MOCK_MODE`: `true` para modo simulado, `false` para WhatsApp real
- `LOG_LEVEL`: `debug` | `info` | `warn` | `error`

### 4. Iniciar servidor

```bash
npm start
```

Acesse **http://localhost:3001** no navegador.

---

## 📚 Documentação da Arquitetura

### 🏗️ Estrutura de Pastas

```
whats/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Aplicação Express
│   │   ├── server.js                 # Inicialização do servidor
│   │   ├── database/
│   │   │   ├── db.js                 # Conexão SQLite
│   │   │   └── migrations.js         # Schema das tabelas
│   │   ├── models/
│   │   │   ├── contatoModel.js       # CRUD de contatos
│   │   │   ├── listaModel.js         # Gerenciamento de listas
│   │   │   ├── campanhaModel.js      # Campanhas
│   │   │   ├── fluxoModel.js         # Fluxos e etapas
│   │   │   ├── queueModel.js         # Fila de envios
│   │   │   └── executionModel.js     # Execução de fluxos
│   │   ├── services/
│   │   │   ├── campaignService.js    # Lógica de campanhas
│   │   │   ├── flowService.js        # Lógica de fluxos
│   │   │   ├── queueService.js       # Gerenciamento da fila
│   │   │   ├── whatsappService.js    # Integração WhatsApp
│   │   │   └── statsService.js       # Estatísticas
│   │   ├── workers/
│   │   │   └── messageWorker.js      # Worker assíncrono
│   │   ├── routes/
│   │   │   ├── index.js              # Roteador principal
│   │   │   ├── contatos.js           # Rotas /api/contatos
│   │   │   ├── listas.js             # Rotas /api/listas
│   │   │   ├── campanhas.js          # Rotas /api/campanhas
│   │   │   ├── fluxos.js             # Rotas /api/fluxos
│   │   │   ├── whatsapp.js           # Rotas /api/whatsapp
│   │   │   ├── stats.js              # Rotas /api/stats
│   │   │   ├── keys.js               # Rotas /api/keys
│   │   │   └── fila.js               # Rotas /api/fila
│   │   └── middleware/
│   │       ├── errorHandler.js       # Tratamento de erros
│   │       ├── logger.js             # Logging
│   │       ├── validateInput.js      # Validação de entrada
│   │       └── apiKeyAuth.js         # Autenticação por API Key
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/
│   ├── index.html                    # HTML principal
│   ├── css/
│   │   └── styles.css                # Estilos globais
│   └── js/
│       ├── app.js                    # Roteador SPA
│       ├── api.js                    # Cliente API
│       ├── components/
│       │   ├── modal.js              # Componente modal
│       │   └── toast.js              # Notificações
│       └── pages/
│           ├── dashboard.js          # Dashboard
│           ├── contacts.js           # Contatos + Listas
│           ├── campaigns.js          # Campanhas
│           ├── flows.js              # Fluxos
│           ├── whatsapp.js           # Conexão WhatsApp
│           └── api.js                # Gerenciamento API Keys
└── README.md
```

### 🗄️ Modelo de Dados

#### Tabelas SQLite

```sql
-- Contatos
CREATE TABLE contatos (
  id INTEGER PRIMARY KEY,
  telefone TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  lista_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lista_id) REFERENCES listas(id)
);

-- Listas
CREATE TABLE listas (
  id INTEGER PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campanhas
CREATE TABLE campanhas (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lista_id INTEGER NOT NULL,
  status TEXT DEFAULT 'rascunho',
  delay_min INTEGER DEFAULT 5,
  delay_max INTEGER DEFAULT 15,
  total_contatos INTEGER DEFAULT 0,
  enviados INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lista_id) REFERENCES listas(id)
);

-- Fila de Envio
CREATE TABLE fila_envio (
  id INTEGER PRIMARY KEY,
  campanha_id INTEGER,
  contato_id INTEGER,
  telefone TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  agendado_para DATETIME NOT NULL,
  enviado_em DATETIME,
  source TEXT DEFAULT 'campaign',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campanha_id) REFERENCES campanhas(id),
  FOREIGN KEY (contato_id) REFERENCES contatos(id)
);

-- Fluxos
CREATE TABLE fluxos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Etapas de Fluxo
CREATE TABLE etapas_fluxo (
  id INTEGER PRIMARY KEY,
  fluxo_id INTEGER NOT NULL,
  ordem INTEGER NOT NULL,
  mensagem TEXT NOT NULL,
  delay_minutos INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fluxo_id) REFERENCES fluxos(id)
);

-- Execução de Fluxo
CREATE TABLE execucao_fluxo (
  id INTEGER PRIMARY KEY,
  fluxo_id INTEGER NOT NULL,
  contato_id INTEGER NOT NULL,
  telefone TEXT NOT NULL,
  status TEXT DEFAULT 'ativo',
  etapa_atual INTEGER DEFAULT 1,
  proxima_execucao DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fluxo_id) REFERENCES fluxos(id),
  FOREIGN KEY (contato_id) REFERENCES contatos(id)
);

-- Logs de WhatsApp
CREATE TABLE whatsapp_logs (
  id INTEGER PRIMARY KEY,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Keys
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  chave TEXT UNIQUE NOT NULL,
  ativa INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API REST - Referência Completa

### Autenticação

Use header `x-api-key: sua-chave` para rotas protegidas:

```bash
curl -H "x-api-key: abc123" http://localhost:3001/api/keys
```

### Contatos

#### Listar
```bash
GET /api/contatos?page=1&limit=50&lista_id=1&search=maria
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Maria Silva",
      "telefone": "5511999999999",
      "lista_id": 1,
      "lista_nome": "VIP",
      "created_at": "2026-05-21T04:00:00Z"
    }
  ],
  "total": 1
}
```

#### Criar
```bash
POST /api/contatos
Content-Type: application/json

{
  "nome": "João Silva",
  "telefone": "5511988888888",
  "lista_id": 1
}
```

#### Importar CSV
```bash
POST /api/contatos/import/1
Content-Type: multipart/form-data

[CSV file with: nome,telefone]
```

Formato CSV esperado:
```csv
João Silva,5511999999999
Maria Santos,5511988888888
```

#### Deletar
```bash
DELETE /api/contatos/1
```

### Listas

#### Listar
```bash
GET /api/listas
```

#### Criar
```bash
POST /api/listas
Content-Type: application/json

{
  "nome": "Clientes VIP"
}
```

#### Deletar
```bash
DELETE /api/listas/1
```

### Campanhas

#### Listar
```bash
GET /api/campanhas
```

#### Criar
```bash
POST /api/campanhas
Content-Type: application/json

{
  "nome": "Promoção Verão",
  "mensagem": "Olá {nome}! Confira nossa promoção especial!",
  "lista_id": 1,
  "delay_min": 5,
  "delay_max": 15
}
```

#### Disparar (Agendar na fila)
```bash
POST /api/campanhas/1/disparar
```

**Response:**
```json
{
  "total": 100,
  "scheduled": 100,
  "message": "100 mensagens agendadas com sucesso"
}
```

#### Detalhes com Fila
```bash
GET /api/campanhas/1
```

#### Deletar
```bash
DELETE /api/campanhas/1
```

### Fluxos

#### Listar
```bash
GET /api/fluxos
```

#### Criar
```bash
POST /api/fluxos
Content-Type: application/json

{
  "nome": "Onboarding Clientes",
  "descricao": "Bem-vindo ao nosso serviço"
}
```

#### Obter detalhes
```bash
GET /api/fluxos/1
```

#### Adicionar Etapa
```bash
POST /api/fluxos/1/etapas
Content-Type: application/json

{
  "mensagem": "Bem-vindo! {nome}",
  "delay_minutos": 0,
  "ordem": 1
}
```

#### Editar Etapa
```bash
PUT /api/fluxos/etapas/1
Content-Type: application/json

{
  "mensagem": "Bem-vindo atualizado!",
  "delay_minutos": 2
}
```

#### Remover Etapa
```bash
DELETE /api/fluxos/etapas/1
```

#### Adicionar Lista ao Fluxo
```bash
POST /api/fluxos/1/adicionar-lista
Content-Type: application/json

{
  "lista_id": 1
}
```

**Response:**
```json
{
  "enrolled": 50,
  "skipped": 10,
  "message": "50 contatos adicionados ao fluxo"
}
```

#### Listar Execuções
```bash
GET /api/fluxos/1/execucoes
```

#### Deletar Fluxo
```bash
DELETE /api/fluxos/1
```

### WhatsApp

#### Status da Conexão
```bash
GET /api/whatsapp/status
```

**Response (Desconectado):**
```json
{
  "status": "disconnected",
  "phone": null
}
```

**Response (Conectado):**
```json
{
  "status": "connected",
  "phone": "+5511999999999",
  "connected_at": "2026-05-21T04:00:00Z"
}
```

**Response (Aguardando Scan):**
```json
{
  "status": "aguardando_scan",
  "qr_code": "data:image/png;base64,iVBORw0KGgo..."
}
```

#### Gerar QR Code
```bash
POST /api/whatsapp/connect
```

#### Simular Scan (Mock)
```bash
POST /api/whatsapp/scan
```

#### Desconectar
```bash
POST /api/whatsapp/disconnect
```

#### Envio de Teste
```bash
POST /api/whatsapp/send-test
Content-Type: application/json

{
  "phone": "5511999999999",
  "message": "Teste de conexão"
}
```

#### Logs de Mensagens
```bash
GET /api/whatsapp/logs?page=1&limit=50
```

### Fila

#### Status da Fila
```bash
GET /api/fila
```

**Response:**
```json
{
  "total": 100,
  "pendentes": 50,
  "enviados": 40,
  "erros": 10,
  "processando": 0
}
```

### Estatísticas

#### Dashboard
```bash
GET /api/stats
```

**Response:**
```json
{
  "totalContatos": 150,
  "totalListas": 5,
  "totalCampanhas": 3,
  "totalFluxos": 2,
  "totalMensagens": 200,
  "campanhasAtivas": 1,
  "queue": {
    "total": 100,
    "pendentes": 50,
    "enviados": 40,
    "erros": 10,
    "processando": 0
  },
  "execucoes": {
    "total": 25,
    "ativos": 5,
    "concluidos": 20,
    "erros": 0
  },
  "recentLogs": [...]
}
```

### API Keys

#### Listar
```bash
GET /api/keys
Headers: x-api-key: sua-chave
```

#### Criar
```bash
POST /api/keys
Headers: x-api-key: sua-chave
Content-Type: application/json

{
  "nome": "Integração CRM"
}
```

#### Deletar
```bash
DELETE /api/keys/1
Headers: x-api-key: sua-chave
```

---

## 🔄 Fluxo de Funcionamento

### Campanhas em Massa

```
┌─────────────────────────────────────────────────┐
│ 1. Usuário cria campanha                        │
│    - Nome, mensagem, lista, delays              │
│    - Status inicial: rascunho                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. Usuário clica "Disparar"                     │
│    - POST /api/campanhas/:id/disparar           │
│    - Busca contatos da lista                    │
│    - Cria entrada na fila_envio para cada um    │
│    - Status muda para: enviando                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Worker (a cada 5 seg)                        │
│    - getPendingMessages() da fila               │
│    - Filtra: status='pendente' AND agendado_para <= now()
│    - Processa 10 por vez                        │
│    - Personaliza {nome} na mensagem             │
│    - Envia via WhatsApp                         │
│    - Atualiza status: enviado/erro              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 4. Dashboard em tempo real                      │
│    - Monitora progresso: enviados/total         │
│    - Exibe logs de atividade                    │
│    - Fila visual e estatísticas                 │
└─────────────────────────────────────────────────┘
```

### Fluxos Sequenciais

```
┌──────────────────────────────────────┐
│ 1. Criar fluxo com 3 etapas          │
│    - Etapa 1: "Bem-vindo, {nome}"    │
│      (enviada imediatamente)         │
│    - Etapa 2: "Aqui está..." (após 2min)
│    - Etapa 3: "Clique aqui..." (após 5min)
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 2. Adicionar lista ao fluxo          │
│    - Para cada contato na lista:     │
│      INSERT execucao_fluxo           │
│      status=ativo, etapa_atual=1     │
│      proxima_execucao=now()          │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 3. Worker processa execuções         │
│    a. getPendingExecutions()         │
│    b. Para cada execução:            │
│       - Busca mensagem da etapa      │
│       - Personaliza {nome}           │
│       - Envia message                │
│       - Se for última etapa:         │
│         status = concluido           │
│       - Se não:                      │
│         etapa_atual++                │
│         proxima_execucao = now() +   │
│           delay_minutos              │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ 4. Execução sequencial automática    │
│    cada contato segue sua trajetória │
│    independente no fluxo             │
└──────────────────────────────────────┘
```

### Worker Assíncrono

```javascript
// messageWorker.js - Executa a cada 5 segundos
setInterval(() => {
  // 1. Processa campanhas
  const campaigns = queueModel.getPendingMessages();
  campaigns.forEach(async msg => {
    try {
      await whatsappService.sendMessage(msg.telefone, msg.mensagem);
      queueModel.markAsSent(msg.id);
    } catch (err) {
      queueModel.markAsError(msg.id, err.message);
    }
  });

  // 2. Processa fluxos
  const executions = executionModel.getPendingExecutions();
  executions.forEach(async exec => {
    const step = fluxoModel.getStep(exec.fluxo_id, exec.etapa_atual);
    const message = step.mensagem.replace('{nome}', exec.nome_contato_db);
    
    try {
      await whatsappService.sendMessage(exec.telefone, message);
      
      if (exec.etapa_atual === totalSteps) {
        executionModel.markAsComplete(exec.id);
      } else {
        executionModel.advanceToNextStep(exec.id, step.delay_minutos);
      }
    } catch (err) {
      executionModel.markAsError(exec.id, err.message);
    }
  });
}, 5000);
```

---

## 💻 Exemplos Práticos de Uso

### Exemplo 1: Campanhas via API (Node.js/cURL)

```bash
# 1. Criar contatos
curl -X POST http://localhost:3001/api/contatos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente A",
    "telefone": "5511999999999"
  }'

# 2. Criar lista
curl -X POST http://localhost:3001/api/listas \
  -H "Content-Type: application/json" \
  -d '{"nome": "Newsletter 2026"}'

# 3. Criar campanha
curl -X POST http://localhost:3001/api/campanhas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Black Friday",
    "mensagem": "Olá {nome}! Desconto de 50%!",
    "lista_id": 1,
    "delay_min": 3,
    "delay_max": 10
  }'

# 4. Disparar
curl -X POST http://localhost:3001/api/campanhas/1/disparar

# 5. Monitorar fila
curl http://localhost:3001/api/fila
```

### Exemplo 2: Fluxo de Vendas

```javascript
// client.js
const API_BASE = 'http://localhost:3001/api';

async function setupSalesFlow() {
  // 1. Criar fluxo
  const flow = await fetch(`${API_BASE}/fluxos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Funil de Vendas',
      descricao: 'Automação de prospecção'
    })
  }).then(r => r.json());
  
  const flowId = flow.id;

  // 2. Adicionar etapas
  const steps = [
    { 
      mensagem: 'Oi {nome}! Conheça nosso produto novo!',
      delay_minutos: 0 
    },
    { 
      mensagem: 'Veja este vídeo: https://...',
      delay_minutos: 2 
    },
    { 
      mensagem: 'Gostou? Faça seu pedido aqui: https://...',
      delay_minutos: 5 
    },
    { 
      mensagem: 'Dúvidas? Estou disponível!',
      delay_minutos: 10 
    }
  ];

  for (const step of steps) {
    await fetch(`${API_BASE}/fluxos/${flowId}/etapas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(step)
    });
  }

  // 3. Adicionar lista ao fluxo
  const result = await fetch(
    `${API_BASE}/fluxos/${flowId}/adicionar-lista`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lista_id: 1 })
    }
  ).then(r => r.json());

  console.log(`✅ Fluxo criado! ${result.enrolled} contatos adicionados`);
}

setupSalesFlow();
```

### Exemplo 3: Importação em Lote

```bash
# contacts.csv
Nome,Telefone
João Silva,5511999999999
Maria Santos,5511988888888
Pedro Oliveira,5511977777777

# Criar lista
curl -X POST http://localhost:3001/api/listas \
  -H "Content-Type: application/json" \
  -d '{"nome": "Base Q2"}'

# Importar CSV
curl -X POST http://localhost:3001/api/contatos/import/1 \
  -F "csv=@contacts.csv"
```

---

## 🔐 Integração com WhatsApp Real

### Configuração (Quando MOCK_MODE=false)

```env
NODE_ENV=production
MOCK_MODE=false
CHROME_PATH=/path/to/chrome  # Opcional: caminho do Chrome
```

### Fluxo de Conexão

1. **Gerar QR Code**
   ```
   POST /api/whatsapp/connect
   Retorna QR code na interface
   ```

2. **Escanear com WhatsApp**
   - Abra WhatsApp no seu celular
   - Vá para: Configurações → Dispositivos conectados → Conectar dispositivo
   - Escaneie o QR code

3. **Conexão Estabelecida**
   - Status muda para `connected`
   - Número do WhatsApp exibido
   - Mensagens serão enviadas automaticamente via fila

### Monitoramento

```bash
# Verificar conexão
curl http://localhost:3001/api/whatsapp/status

# Logs de envios
curl http://localhost:3001/api/whatsapp/logs?limit=100
```

---

## 🎨 Interface Frontend

### Estrutura SPA (Single Page Application)

```javascript
// app.js - Roteador principal
const pages = {
  dashboard: DashboardPage,
  contacts: ContactsPage,
  lists: ListsPage,
  campaigns: CampaignsPage,
  flows: FlowsPage,
  whatsapp: WhatsAppPage,
  api: ApiPage
};

// Navegação
App.navigate('campaigns'); // Carrega página de campanhas
```

### Componentes Reutilizáveis

**Modal (Criar/Editar)**
```javascript
Modal.form({
  title: 'Nova Campanha',
  fields: [
    { name: 'nome', label: 'Nome', required: true },
    { name: 'mensagem', label: 'Mensagem', type: 'textarea' }
  ],
  onSubmit: async (data, close) => {
    await api.campanhas.create(data);
    close();
    loadCampanhas();
  }
});
```

**Toast (Notificações)**
```javascript
Toast.success('Enviado!', '100 mensagens agendadas');
Toast.error('Erro', 'Falha na conexão');
Toast.warning('Atenção', 'Nenhuma lista selecionada');
```

**Dashboard Ao Vivo**
```javascript
// Atualiza a cada 5 segundos
setInterval(loadData, 5000);

// Animação de contadores
animateCount(element, targetNumber);
```

---

## 🧪 Desenvolvimento e Testes

### Modo Mock

No `.env`:
```env
MOCK_MODE=true
```

Simula envios sem WhatsApp real:
- QR Code aleatório
- Mensagens gravadas em logs
- Status `mock_sent` nos registros

### Logs

Todos os eventos são registrados em:
```
whatsapp_logs table
├── phone
├── message
├── status (sent, mock_sent, error)
├── source (campaign, flow, test)
└── timestamp
```

---

## 📦 Dependências

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "sqlite3": "^5.1.0",
    "whatsapp-web.js": "^1.20.0",
    "qrcode-terminal": "^0.12.0",
    "multer": "^1.4.5",
    "uuid": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}
```

---

## 🚨 Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|--------|
| `Connection Refused` | Servidor não está rodando | `npm start` no backend |
| `Invalid Phone Format` | Número sem +55 | Use formato: `55119999999` |
| `Queue Timeout` | Muitos envios simultâneos | Aumente `delay_max` |
| `WhatsApp Blocked` | Conta banida | Procure WhatsApp Support |

### Debug

```env
LOG_LEVEL=debug
```

Logs detalhados em console:
```
[DEBUG] Worker: 10 pending messages found
[DEBUG] Sending to 5511999999999
[DEBUG] Message sent successfully
[INFO] Queue: 1 pending, 9 sent, 0 errors
```

---

## 🤝 Contribuindo

1. Faça um fork
2. Crie uma branch (`git checkout -b feature/nova-funcao`)
3. Commit (`git commit -m 'Add nova funcao'`)
4. Push (`git push origin feature/nova-funcao`)
5. Abra Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes

---

## 🎯 Roadmap

- [ ] Agendamento recorrente (diário, semanal)
- [ ] Webhooks para eventos
- [ ] Integração com CRM (Pipedrive, Hubspot)
- [ ] Analytics avançado
- [ ] A/B Testing de campanhas
- [ ] Backup automático
- [ ] Multi-dispositivo WhatsApp
- [ ] Templates de mensagens
- [ ] Bot com IA

---

**Versão:** 1.0.0  
**Última atualização:** Maio/2026  
**Mantido por:** [yummisDev]
