const request = require('supertest');
const app = require('./app');

describe('User Registration and Login', () => {
  it('should register and login a user successfully', async () => {
    // Register a user
    const registerRes = await request(app)
      .post('/register')
      .send({
        username: 'username',
        password: 'password',
        email: 'testuser@example.com'
      });

    // Check if registration was successful
    expect(registerRes.status).toBe(201);

    // Login with the registered user
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });

    // Check if login was successful and token is received
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });
});
