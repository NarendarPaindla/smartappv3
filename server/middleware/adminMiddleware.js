const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.log('Admin Middleware: Access denied for user', req.user ? req.user.email : 'unknown', 'Role:', req.user ? req.user.role : 'none');
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { admin };
