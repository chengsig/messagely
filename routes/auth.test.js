process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require('../app');
const bcrypt = require('bcrypt');
const db = require('../db');
const User = require('../models/user')

beforeEach(async function() {
    
    await User.register({username: 'test1',
                         password: 'secret',
                         first_name: 'test1',
                         last_name: 'test1',
                         phone: '555-555-5555'});

});

afterEach(async function() {
    await db.query(`DELETE FROM users`);
});

describe("POST /auth/login", function() {

    test("returns 'token' on successful login", async function() {

        const loginResp = await request(app)
            .post('/auth/login')
            .send({
                username: 'test1',
                password: 'secret'
            });

        expect(loginResp.statusCode).toBe(200);
        expect(loginResp.body).toHaveProperty('token');
    });

    test("returns error if missing fields", async function() {

        const loginResp = await request(app)
            .post('/auth/login')
            .send({
                username: "test1"
            });

       

        expect(loginResp.statusCode).toBe(404);
        expect(loginResp.body.message).toBe('Missing key: password needed');
    });

    test("returns error if username doesn't exist", async function() {
        
        const loginResp = await request(app)
            .post('/auth/login')
            .send({
                username: 'test2',
                password: 'secret'
            });

        expect(loginResp.statusCode).toBe(400);
        expect(loginResp.body.message).toBe('Invalid user/password');
    });

    test("returns error if wrong password", async function() {
        
        const loginResp = await request(app)
            .post('/auth/login')
            .send({
                username: 'test1',
                password: 'secret2'
            });

        expect(loginResp.statusCode).toBe(400);
        expect(loginResp.body.message).toBe('Invalid user/password');
    });
});