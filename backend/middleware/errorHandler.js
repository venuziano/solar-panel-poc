/**
 * Express error-handling middleware.
 * Catches any errors passed via `next(err)` and sends a standardized JSON response.
 */
const errorHandler = (err, req, res, next) => {
  if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });

  // Here we could insert the log into the database.
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = { errorHandler }