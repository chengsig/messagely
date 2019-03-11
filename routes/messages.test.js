process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require('./app');
const bcrypt = require('bcrypt');
const db = require('../db');

let auth = {};

beforeEach(async function() {
    const hashedPassword = await bcrypt.hash('secret', 1);
    await db.query(
        `INSERT INTO users (username, password)
            VALUES ('test', $1)`,
        [hashedPassword]);

    const response = await request(app)
        .post("/login")
        .send({
            username: "test",
            password: "secret"
        });
    
    auth.token = response.body.token;

    auth.curr_user_id = "test";

})