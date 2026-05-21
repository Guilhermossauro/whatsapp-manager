function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  if (process.env.NODE_ENV !== 'production') {
    process.stderr.write(`[ERROR] ${err.stack}\n`);
  }
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
