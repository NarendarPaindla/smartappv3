const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { name, email, password, defaultCurrency, monthStartDay } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    try {
        const user = await User.create({
            name,
            email,
            password,
            defaultCurrency,
            monthStartDay,
            trialExpiresAt: Date.now() + 60 * 60 * 1000, // 1 hour from now
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                defaultCurrency: user.defaultCurrency,
                monthStartDay: user.monthStartDay,
                role: user.role,
                isSubscribed: user.isSubscribed,
                trialExpiresAt: user.trialExpiresAt,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            defaultCurrency: user.defaultCurrency,
            monthStartDay: user.monthStartDay,
            role: user.role,
            isSubscribed: user.isSubscribed,
            trialExpiresAt: user.trialExpiresAt,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.defaultCurrency = req.body.defaultCurrency || user.defaultCurrency;

        if (req.body.password) {
            user.password = req.body.password;
        }

        try {
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                defaultCurrency: updatedUser.defaultCurrency,
                monthStartDay: updatedUser.monthStartDay,
                role: updatedUser.role,
                isSubscribed: updatedUser.isSubscribed,
                trialExpiresAt: updatedUser.trialExpiresAt,
                token: generateToken(updatedUser._id),
            });
        } catch (error) {
            console.error('Error saving user:', error);
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Social Login Routes
const passport = require('passport');

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                console.error('Google Auth Error:', err);
                return res.redirect('http://localhost:5173/login?error=auth_failed');
            }
            if (!user) {
                console.error('Google Auth Failed: No user returned');
                return res.redirect('http://localhost:5173/login?error=no_user');
            }
            const token = generateToken(user._id);
            res.redirect(`http://localhost:5173/login?token=${token}`);
        })(req, res, next);
    }
);

// GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    (req, res, next) => {
        passport.authenticate('github', { session: false }, (err, user, info) => {
            if (err) {
                console.error('GitHub Auth Error:', err);
                return res.redirect('http://localhost:5173/login?error=auth_failed');
            }
            if (!user) {
                return res.redirect('http://localhost:5173/login?error=no_user');
            }
            const token = generateToken(user._id);
            res.redirect(`http://localhost:5173/login?token=${token}`);
        })(req, res, next);
    }
);

// LinkedIn
router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback',
    (req, res, next) => {
        passport.authenticate('linkedin', { session: false }, (err, user, info) => {
            if (err) {
                console.error('LinkedIn Auth Error:', err);
                return res.redirect('http://localhost:5173/login?error=auth_failed');
            }
            if (!user) {
                return res.redirect('http://localhost:5173/login?error=no_user');
            }
            const token = generateToken(user._id);
            res.redirect(`http://localhost:5173/login?token=${token}`);
        })(req, res, next);
    }
);

// @desc    Mock Subscription Payment
// @route   POST /api/auth/subscribe
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.isSubscribed = true;
        user.plan = req.body.plan || 'monthly';
        user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        if (user.plan === 'annual') {
            user.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            defaultCurrency: updatedUser.defaultCurrency,
            monthStartDay: updatedUser.monthStartDay,
            role: updatedUser.role,
            isSubscribed: updatedUser.isSubscribed,
            trialExpiresAt: updatedUser.trialExpiresAt,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Heartbeat to track usage
// @route   POST /api/auth/heartbeat
// @access  Private
router.post('/heartbeat', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.lastActive = new Date();
            user.totalUsageMinutes = (user.totalUsageMinutes || 0) + 1;
            await user.save();
            res.status(200).json({ message: 'Heartbeat received' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Heartbeat Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        console.log('Forgot Password: Token generated');

        await user.save({ validateBeforeSave: false });
        console.log('Forgot Password: User saved with token');

        // Create reset url
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            console.log('Forgot Password: Sending email...');
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
            });
            console.log('Forgot Password: Email sent successfully');

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            console.error('Forgot Password: Email send failed:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            res.status(500);
            throw new Error('Email could not be sent');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
router.put('/reset-password/:resetToken', async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400);
            throw new Error('Invalid token');
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            data: 'Password updated success',
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
