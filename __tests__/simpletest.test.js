// const addition = require('./simpletest');
const request = require('supertest');
const httpServer = require("./app.js");
const authSchema = require('../models/auth.js')

const fullName = "Princewill Jeremiah";
const email = "princewilljeremiah91@gmail.com"

beforeAll(async () => {
    await authSchema.findOneAndDelete({email})
})

afterAll(async () => {
    httpServer.close();
    mongoose.disconnect();
    console.log("Server stopped");
})

describe('Test for register and login features', () => {
    test('Register a customer with, full name, email, passoword and role', async () =>{
        const response = await request(httpServer).post('/register')
        .set('Content-Type', 'application/json')
        .send({
            fullName: fullName,
            email: email,
            password: '987654321',
            role: 'customer'
        })
    })
})

