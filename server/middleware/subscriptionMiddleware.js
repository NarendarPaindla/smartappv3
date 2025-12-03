const checkSubscription = (req, res, next) => {
    const user = req.user;

    // Admins always have access
    if (user.role === 'admin') {
        return next();
    }

    const now = new Date();

    // Check if subscription is active
    if (user.isSubscribed && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > now) {
        return next();
    }

    // Check if trial is active
    if (user.trialExpiresAt && new Date(user.trialExpiresAt) > now) {
        return next();
    }

    // If neither, access denied
    res.status(403);
    throw new Error('Subscription required. Your trial has expired.');
};

module.exports = { checkSubscription };
