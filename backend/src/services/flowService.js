const flowModel = require('../models/flowModel');
const executionModel = require('../models/executionModel');
const contactModel = require('../models/contactModel');

function enrollList(fluxoId, listaId) {
  const fluxo = flowModel.findByIdWithSteps(fluxoId);
  if (!fluxo) throw new Error('Fluxo não encontrado');
  if (!fluxo.ativo) throw new Error('Fluxo inativo');
  if (!fluxo.etapas || fluxo.etapas.length === 0) throw new Error('Fluxo sem etapas configuradas');

  const contacts = contactModel.findByListId(listaId);
  if (contacts.length === 0) throw new Error('Lista de contatos vazia');

  const now = new Date().toISOString();
  let enrolled = 0;
  let skipped = 0;

  for (const contact of contacts) {
    if (executionModel.alreadyEnrolled(fluxoId, contact.id)) {
      skipped++;
      continue;
    }
    executionModel.create({
      fluxoId,
      contatoId: contact.id,
      telefone: contact.telefone,
      nomeContato: contact.nome,
      proximaExecucao: now
    });
    enrolled++;
  }

  return { enrolled, skipped, total: contacts.length };
}

module.exports = { enrollList };
