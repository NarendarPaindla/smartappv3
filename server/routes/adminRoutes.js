const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeUsers = await User.countDocuments({
            role: { $ne: 'admin' },
            lastActive: { $gte: fifteenMinutesAgo }
        });

        const users = await User.find({ role: { $ne: 'admin' } }).select('totalUsageMinutes');
        const totalMinutes = users.reduce((acc, user) => acc + (user.totalUsageMinutes || 0), 0);
        const totalHours = Math.round(totalMinutes / 60);

        res.json({
            totalUsers,
            activeUsers,
            totalHours,
            totalMinutes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
        } : {};

        const filter = { ...keyword };

        if (req.query.role) {
            filter.role = req.query.role;
        } else {
            // Default: Exclude admins if no specific role requested
            filter.role = { $ne: 'admin' };
        }

        if (req.query.status) {
            if (req.query.status === 'active') filter.isActive = true;
            if (req.query.status === 'inactive') filter.isActive = false;
        }

        console.log('Admin Users Filter:', JSON.stringify(filter));
        const count = await User.countDocuments(filter);
        console.log('Admin Users Count:', count);

        const users = await User.find(filter)
            .select('-password')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        console.log('Admin Users Found:', users.length);

        res.json({
            users,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isActive = !user.isActive;
            await user.save();

            // Log Audit
            await AuditLog.create({
                adminId: req.user._id,
                action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
                targetUserId: user._id,
                details: `User ${user.email} was ${user.isActive ? 'activated' : 'deactivated'}`,
                ip: req.ip
            });

            res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Confirm payment
// @route   POST /api/admin/users/:id/confirm-payment
// @access  Private/Admin
router.post('/users/:id/confirm-payment', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { amount, plan } = req.body;

        if (user) {
            user.isSubscribed = true;
            user.plan = plan || 'monthly';
            user.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year for manual confirm

            user.paymentRecords.push({
                amount: amount || 0,
                status: 'paid',
                confirmedBy: req.user._id,
                date: new Date()
            });

            await user.save();

            // Log Audit
            await AuditLog.create({
                adminId: req.user._id,
                action: 'CONFIRM_PAYMENT',
                targetUserId: user._id,
                details: `Payment of ${amount} confirmed for ${user.email}. Plan: ${user.plan}`,
                ip: req.ip
            });

            res.json({ message: 'Payment confirmed and subscription active' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
router.get('/audit-logs', protect, admin, async (req, res) => {
    try {
        const logs = await AuditLog.find({})
            .populate('adminId', 'name email')
            .populate('targetUserId', 'name email')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Export users to CSV
// @route   GET /api/admin/export
// @access  Private/Admin
router.get('/export', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');

        const fields = ['name', 'email', 'role', 'plan', 'isSubscribed', 'lastLogin', 'totalUsageMinutes', 'isActive'];
        const csv = users.map(user => {
            return fields.map(field => {
                if (field === 'lastLogin') return user[field] ? new Date(user[field]).toISOString() : '';
                return JSON.stringify(user[field] || '');
            }).join(',');
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
        res.send([fields.join(','), ...csv].join('\n'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Grant access manually (Legacy support)
// @route   PUT /api/admin/users/:id/grant
// @access  Private/Admin
router.put('/users/:id/grant', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isSubscribed = true;
            user.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
            await user.save();

            await AuditLog.create({
                adminId: req.user._id,
                action: 'GRANT_ACCESS',
                targetUserId: user._id,
                details: `Manual access grant for ${user.email}`,
                ip: req.ip
            });

            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Revoke access manually
// @route   PUT /api/admin/users/:id/revoke
// @access  Private/Admin
router.put('/users/:id/revoke', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isSubscribed = false;
            user.subscriptionExpiresAt = null;
            await user.save();

            await AuditLog.create({
                adminId: req.user._id,
                action: 'REVOKE_ACCESS',
                targetUserId: user._id,
                details: `Access revoked for ${user.email}`,
                ip: req.ip
            });

            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user details (Role, Plan, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // Handle Role Change
            if (req.body.role) {
                user.role = req.body.role;
            }

            // Handle Plan Change
            if (req.body.plan) {
                user.plan = req.body.plan;
                if (user.plan !== 'free') {
                    user.isSubscribed = true;
                    // If switching to paid, ensure expiry is set if not already
                    if (!user.subscriptionExpiresAt || user.subscriptionExpiresAt < Date.now()) {
                        user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
                    }
                } else {
                    // Switching to Free
                    user.isSubscribed = false;
                    if (req.body.resetUsage) {
                        user.totalUsageMinutes = 0;
                        user.trialExpiresAt = null; // Clear any previous trial expiry to allow fresh start logic if needed
                    }
                }
            }

            const updatedUser = await user.save();

            await AuditLog.create({
                adminId: req.user._id,
                action: 'UPDATE_USER',
                targetUserId: user._id,
                details: `Updated details for ${user.email}. Role: ${user.role}, Plan: ${user.plan}`,
                ip: req.ip
            });

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                plan: updatedUser.plan,
                isSubscribed: updatedUser.isSubscribed
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();

            await AuditLog.create({
                adminId: req.user._id,
                action: 'DELETE_USER',
                details: `Deleted user ${user.email}`,
                ip: req.ip
            });

            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
