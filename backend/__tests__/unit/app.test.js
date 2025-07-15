process.env.WEATHER_API_KEY = 'dummy-key';

const request = require('supertest');
const express = require('express');

const authRoutes = require('../../routes/auth');
const installationsRoutes = require('../../routes/installations');
const { errorHandler } = require('../../middleware/errorHandler');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', authRoutes);
  app.use('/api', installationsRoutes);
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use(errorHandler);
  return app;
}

describe('HTTP routes', () => {
  let app;
  beforeAll(() => {
    app = buildApp();
  });

  test('GET /health → 200 { status: "ok" }', async () => {
    await request(app)
      .get('/health')
      .expect(200, { status: 'ok' });
  });

  test('unknown route → 404 JSON', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
