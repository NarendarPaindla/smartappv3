const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // console.log('Auth Token:', token); // Too noisy

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log('Decoded ID:', decoded.id);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log('Auth Middleware: User not found for ID', decoded.id);
            } else {
                // console.log('Auth Middleware: User found', req.user.email);
            }

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        console.log('Auth Middleware: No token provided');
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};

module.exports = { protect };
