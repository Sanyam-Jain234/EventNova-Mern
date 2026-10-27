export function notFound(req, res, next) {
  res.status(404).json({ message: `Route nahi mila: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? "Server me kuch gadbad hui" : err.message,
  });
}