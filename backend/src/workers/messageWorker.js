const cron = require('node-cron');
const queueModel = require('../models/queueModel');
const executionModel = require('../models/executionModel');
const flowModel = require('../models/flowModel');
const campaignModel = require('../models/campaignModel');
const whatsappService = require('../services/whatsappService');

async function processCampaignQueue() {
  const pending = queueModel.getPendingMessages();
  for (const item of pending) {
    try {
      queueModel.updateStatus(item.id, 'processando');
      await whatsappService.sendMessage(item.telefone, item.mensagem, 'campaign', item.campanha_id, item.nome_contato);
      queueModel.updateStatus(item.id, 'enviado', new Date().toISOString());
      campaignModel.updateCounters(item.campanha_id, { enviados: 1 });
    } catch (err) {
      queueModel.updateStatusWithError(item.id, 'erro', err.message);
      campaignModel.updateCounters(item.campanha_id, { erros: 1 });
    }
  }
}

async function processFlowExecutions() {
  const pending = executionModel.getPendingExecutions();
  for (const execution of pending) {
    try {
      const step = flowModel.getStepByOrder(execution.fluxo_id, execution.etapa_atual);
      if (!step) {
        executionModel.markComplete(execution.id);
        continue;
      }
      const mensagem = step.mensagem.replace('{nome}', execution.nome_contato || execution.nome_contato_db || '');
      await whatsappService.sendMessage(execution.telefone, mensagem, 'flow', execution.fluxo_id, execution.nome_contato);
      const nextStep = flowModel.getStepByOrder(execution.fluxo_id, execution.etapa_atual + 1);
      if (nextStep) {
        const nextTime = new Date(Date.now() + nextStep.delay_minutos * 60 * 1000).toISOString();
        executionModel.advance(execution.id, execution.etapa_atual + 1, nextTime);
      } else {
        executionModel.markComplete(execution.id);
      }
    } catch (err) {
      executionModel.markError(execution.id, err.message);
    }
  }
}

function checkCampaignCompletions() {
  const db = require('../database/db');
  const campaigns = db.prepare("SELECT id FROM campanhas WHERE status = 'enviando'").all();
  for (const c of campaigns) {
    const pending = db.prepare("SELECT COUNT(*) as total FROM fila_envio WHERE campanha_id = ? AND status IN ('pendente', 'processando')").get(c.id);
    if (pending.total === 0) {
      campaignModel.updateStatus(c.id, 'concluida');
    }
  }
}

function startWorker() {
  cron.schedule('*/5 * * * * *', async () => {
    try {
      await processCampaignQueue();
      await processFlowExecutions();
      checkCampaignCompletions();
    } catch (err) {
      process.stderr.write(`Worker error: ${err.message}\n`);
    }
  });
  process.stdout.write('Message worker started (every 5 seconds)\n');
}

module.exports = { startWorker };
