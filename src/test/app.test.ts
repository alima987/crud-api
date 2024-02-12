import request from 'supertest';
import { server } from '../app';

describe('API tests', () => {
  afterAll(() => {
    server.close();
  });

  it('should return an empty array for GET api/users when no records exist', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should create a new object with a POST api/users request', async () => {
    const newUser = { name: 'John Doe', email: 'john@example.com' };
    const response = await request(server).post('/api/users').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newUser);
  });

  it('should return the created record with a GET api/users/{userId} request', async () => {
    const newUser = { name: 'Jane Smith', email: 'jane@example.com' };
    const response = await request(server).post('/api/users').send(newUser);
    const userId = response.body.id;
    const getResponse = await request(server).get(`/api/users/${userId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toMatchObject(newUser);
  });

  it('should update the created record with a PUT api/users/{userId} request', async () => {
    const newUser = { name: 'Jane Smith', email: 'jane@example.com' };
    const response = await request(server).post('/api/users').send(newUser);
    const userId = response.body.id;
    const updatedUser = { ...newUser, name: 'Jane Doe' };
    const updateResponse = await request(server).put(`/api/users/${userId}`).send(updatedUser);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject(updatedUser);
  });

  it('should delete the created object with a DELETE api/users/{userId} request', async () => {
    const newUser = { name: 'Jane Smith', email: 'jane@example.com' };
    const response = await request(server).post('/api/users').send(newUser);
    const userId = response.body.id;
    const deleteResponse = await request(server).delete(`/api/users/${userId}`);
    expect(deleteResponse.status).toBe(204);
    const getResponse = await request(server).get(`/api/users/${userId}`);
    expect(getResponse.status).toBe(404);
  });
});
