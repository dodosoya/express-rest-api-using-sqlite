const request = require('supertest');
const app = require('../src/app');

describe('Test endpoint: /api/users', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  test('create user', async () => {
    await request(app)
      .post('/api/users')
      .send({ name: 'Ryan', age: 18 });
    const res = await request(app).get('/api/users');
    const response = [
      { id: 1, name: 'Ryan', age: 18 }
    ];
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
  
  test('get users', async () => {
    const res = await request(app).get('/api/users');
    const response = [
      { id: 1, name: 'Ryan', age: 18 }
    ];
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });

  test('get specific user', async () => {
    const res = await request(app).get('/api/users/1');
    const response = { id: 1, name: 'Ryan', age: 18 };
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
  
  test('update user', async () => {
    await request(app)
      .put('/api/users/1')
      .send({ name: 'Ryan+', age: 20 });
    const res = await request(app).get('/api/users/1');
    const response = { id: 1, name: 'Ryan+', age: 20 };
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
  
  test('delete user', async () => {
    await request(app).delete('/api/users/1');
    const res = await request(app).get('/api/users/1');
    const response = {};
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
});