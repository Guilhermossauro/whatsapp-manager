const campaignModel = require('../models/campaignModel');
const queueModel = require('../models/queueModel');
const contactModel = require('../models/contactModel');

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function dispatch(campaignId) {
  const campaign = campaignModel.findById(campaignId);
  if (!campaign) throw new Error('Campanha não encontrada');
  if (campaign.status === 'enviando') throw new Error('Campanha já está sendo disparada');
  if (!campaign.lista_id) throw new Error('Campanha não possui lista de contatos');

  const contacts = contactModel.findByListId(campaign.lista_id);
  if (contacts.length === 0) throw new Error('Lista de contatos vazia');

  campaignModel.updateStatus(campaignId, 'enviando');
  campaignModel.updateCounters(campaignId, { totalContatos: contacts.length });

  let scheduledTime = Date.now();

  const items = contacts.map((contact) => {
    const delaySec = randomDelay(campaign.delay_min, campaign.delay_max);
    scheduledTime += delaySec * 1000;
    return {
      campanha_id: campaignId,
      contato_id: contact.id,
      telefone: contact.telefone,
      nome_contato: contact.nome,
      mensagem: campaign.mensagem.replace('{nome}', contact.nome),
      agendado_para: new Date(scheduledTime).toISOString()
    };
  });

  queueModel.bulkCreate(items);

  return { total: contacts.length, firstScheduled: items[0]?.agendado_para };
}

module.exports = { dispatch };
