const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mockUserUUID = crypto.randomUUID()

jest.mock('../../seeds/users', () => ({
  users: [
    { id: 42, uuid: mockUserUUID, username: 'eve', password: 'hunter2', role: 'technician' }
  ]
}));

const loginRoute = require('../../routes/auth');

describe('POST /api/login (E2E)', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    app = express();
    app.use(express.json());
    app.use('/api', loginRoute);
  });

  it('returns 400 + validation errors if body missing fields', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({}); // no username/password
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    const msgs = res.body.errors.map(e => e.msg);
    expect(msgs).toEqual(
      expect.arrayContaining([
        'username is required',
        'password is required'
      ])
    );
  });

  it('returns 401 for wrong credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'eve', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('returns 200 + token & user for correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'eve', password: 'hunter2' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toEqual({
      uuid: mockUserUUID,
      username: 'eve',
      role: 'technician'
    });

    // verify JWT payload
    const payload = jwt.verify(res.body.token, 'test-secret');
    expect(payload).toMatchObject({
      userUUID: mockUserUUID,
      username: 'eve',
      role: 'technician'
    });
  });
});
