const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const auth = require('../models/auth.js')

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        // Basic validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await auth.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create and save new user
        const newUser = new auth({
            fullName,
            email: email.toLowerCase(),
            password,
            role: role || 'customer'
        });

        const savedUser = await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: savedUser._id,
                email: savedUser.email,
                role: savedUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            data: {
                id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                role: savedUser.role
            }
        });

    } catch (error) {
        // Handle duplicate email error from database
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await auth.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );


        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

module.exports = router;