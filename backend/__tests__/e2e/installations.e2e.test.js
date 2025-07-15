const request = require('supertest');
const express = require('express');

jest.mock('../../middleware/authMiddleware', () => ({
  verifyToken: (req, res, next) => { req.user = { role: 'admin' }; next(); }
}));

jest.mock('../../helpers/rbac', () => ({
  hasPermission: () => (req, res, next) => next(),
  PERMISSIONS: { VIEW_INSTALLATIONS: 'view_installations', CREATE_INSTALLATION: 'create_installation' }
}));

const seed = [
  { id: 1, date: '2025-01-01', address: 'X', state: "Y", status: 'scheduled', estimatedCostSavings: 0 },
  { id: 2, date: '2025-01-02', address: 'Z', state: "W", status: 'scheduled', estimatedCostSavings: 0 }
];

jest.mock('../../seeds/installations', () => ({
  installations: [...seed],
  INSTALLATION_STATUS: { SCHEDULED: 'scheduled' }
}));

jest.mock('../../routeValidators/paginationValidators', () => ({
  paginationValidators: []
}));

const mockGetWeatherByAddress = jest.fn(async loc => ({ sys: { sunrise: 0, sunset: 3600 }, weather: [{ id: 800 }] }));
const mockCategorizeWeatherByCode = jest.fn(code => 'Clear');

jest.mock('../../services/weatherService', () => {
  return class {
    async getWeatherByAddress(city) {
      return mockGetWeatherByAddress(city);
    }
    categorizeWeatherByCode(code) {
      return mockCategorizeWeatherByCode(code);
    }
  };
});

const installationsRouter = require('../../routes/installations');

describe('/api/installations E2E', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', installationsRouter);
  });

  it('GET 200 → paginated list with weatherForecast', async () => {
    const res = await request(app).get('/api/installations');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      page: 1,
      limit: 10,
      totalItems: seed.length
    });
    expect(res.body.items.every(i => i.weatherForecast === 'Clear')).toBe(true);
    expect(mockGetWeatherByAddress).toHaveBeenCalledTimes(2);
  });

  it('GET 400 on invalid status query', async () => {
    const res = await request(app).get('/api/installations?status=invalid');
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST 400 on missing/invalid body', async () => {
    const res = await request(app).post('/api/installations').send({});
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);

    const msgs = res.body.errors.map(e => e.msg);
    expect(msgs).toEqual(expect.arrayContaining([
      'date is required',
      'address is required',
      'state is required',
      'panelCapacity_kW is required',
      'efficiency is required',
      'electricityRate is required'
    ]));
  });

  it('POST 201 on valid installation creation', async () => {
    const payload = {
      date: '2025-06-01',
      address: 'Houston',
      state: "TX",
      panelCapacity_kW: 1.5,
      efficiency: 0.8,
      electricityRate: 0.25
    };
    const res = await request(app)
      .post('/api/installations')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'Installation created successfully' });

    const get2 = await request(app).get('/api/installations');
    expect(get2.body.totalItems).toBe(seed.length + 1);
  });
});
