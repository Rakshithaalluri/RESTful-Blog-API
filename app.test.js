const request = require('supertest');
const app = require('./app');

describe('User Registration', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'username',
        password: 'password',
        email: 'testuser@example.com'
      });
    
    expect(res.status).toBe(201);
    expect(res.text).toBe('User registered successfully');
  });

  it('should not register a user without a username', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        password: 'testpassword',
        email: 'testuser@example.com'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toBe('Username is required');
  });
});
