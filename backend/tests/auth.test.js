const request = require('supertest');
const app = require('../server');
const { clearDB, connectDB } = require('./helpers');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());

describe('POST /api/auth/register', () => {
  const validPayload = {
    firstName: 'Meera',
    lastName: 'Krishna',
    email: 'meera@example.com',
    password: 'password123',
    role: 'Passenger',
  };

  test('registers a new passenger successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('meera@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // never exposed
  });

  test('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(409);
  });

  test('rejects weak password (< 8 chars)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPayload, password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('rejects driver registration without license', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, role: 'Driver', licenseNumber: undefined });
    expect(res.status).toBe(400);
  });

  test('accepts driver with license number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, role: 'Driver', licenseNumber: 'KA-DL-12345' });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Meera', lastName: 'Krishna', email: 'meera@example.com',
      password: 'password123', role: 'Passenger',
    });
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'meera@example.com', password: 'password123', role: 'Passenger' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'meera@example.com', password: 'wrongpass', role: 'Passenger' });
    expect(res.status).toBe(401);
  });

  test('rejects correct password but wrong role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'meera@example.com', password: 'password123', role: 'Driver' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  test('returns current user with valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      firstName: 'Meera', lastName: 'Krishna', email: 'meera@example.com',
      password: 'password123', role: 'Passenger',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.data.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('meera@example.com');
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
