require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const installationsRoutes = require('./routes/installations');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', installationsRoutes);

// NOTE: We could have a rate limiter middleware here as well.
app.use(errorHandler);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

process.on('unhandledRejection', (reason, _) => {
  console.log('Unhandled Rejection', reason)
  // We can end the process to avoid staying in a corrupted state indefinitely.
  // We could let AWS restart it automatically.
  // We could insert the log into the database.
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception', err)
  // We can end the process to avoid staying in a corrupted state indefinitely.
  // We could let AWS restart it automatically.
  // We could insert the log into the database.
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
