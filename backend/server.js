require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/database/migrations');
const { startWorker } = require('./src/workers/messageWorker');

const PORT = process.env.PORT || 3001;

initDatabase();
startWorker();

app.listen(PORT, () => {
  process.stdout.write(`WhatsApp Manager running on http://localhost:${PORT}\n`);
});
