const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, '../../frontend')));

app.use('/api', routes);

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
  }
});

app.use(errorHandler);

module.exports = app;
