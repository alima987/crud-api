import request from 'supertest';
import { server } from "../app";

describe('API test', () => {   
    afterAll((done) => {
        server.close(done);
    });
    it('GET /api/users - should return empty array initially', async() => {
       const response = await request(server).get('/api/users');
       expect(response.statusCode).toBe(200)
       expect(response.body).toEqual([])
    })
    it('POST /api/users - should create new user', async() => {
        const newPost = { "username": "Alice", "age": 30, "hobbies": ["running"]}
       const response = await request(server).post('/api/users').send(newPost);
       expect(response.statusCode).toBe(201)
       expect(response.body).toMatchObject(newPost)
    })
    it('GET /api/users/:id - should return the created user', async() => {
        const newPost = { "username": "Alice", "age": 30, "hobbies": ["running"]}
        const response = await request(server).post('/api/users').send(newPost);
        const userId = response.body.id
        const getRes = await request(server).get(`/api/users/${userId}`)
        expect(getRes.statusCode).toBe(200)
        expect(getRes.body).toMatchObject(newPost)
    })
    it('PUT /api/users/:id - should update user', async() => {
        const newPost = { "username": "Alice", "age": 30, "hobbies": ["running"]}
        const response = await request(server).post('/api/users').send(newPost);
        const userId = response.body.id
        const updatedPost = { ...newPost, 'username': "Monica", 'age': 25 }
        const getRes = await request(server).put(`/api/users/${userId}`).send(updatedPost);
        expect(getRes.statusCode).toBe(200)
        expect(getRes.body).toMatchObject(updatedPost)
    })
    it('DELETE api/users/{userId} - should delete the created object by id', async() => {
        const newPost = { "username": "Alice", "age": 30, "hobbies": ["running"]}
        const response = await request(server).post('/api/users').send(newPost);
        const userId = response.body.id
        const getRes = await request(server).delete(`/api/users/${userId}`);
        expect(getRes.statusCode).toBe(204)
        const getResponse = await request(server).get(`/api/users/${userId}`);
        expect(getResponse.status).toBe(404);
    })
})