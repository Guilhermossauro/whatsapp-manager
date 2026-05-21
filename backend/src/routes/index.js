const express = require('express');
const router = express.Router();
const apiAuth = require('../middleware/apiAuth');

const contactsRoutes = require('./contacts');
const listsRoutes = require('./lists');
const campaignsRoutes = require('./campaigns');
const flowsRoutes = require('./flows');
const whatsappRoutes = require('./whatsapp');
const statsRoutes = require('./stats');
const keysRoutes = require('./keys');
const queueRoutes = require('./queue');

// Todas as rotas /api/* requerem autenticação
router.use(apiAuth);

router.use('/contatos', contactsRoutes);
router.use('/listas', listsRoutes);
router.use('/campanhas', campaignsRoutes);
router.use('/fluxos', flowsRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/stats', statsRoutes);
router.use('/keys', keysRoutes);
router.use('/fila', queueRoutes);

module.exports = router;
