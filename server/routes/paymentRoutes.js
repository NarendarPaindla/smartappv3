const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', protect, async (req, res) => {
    const { plan } = req.body;
    let amount = 0;
    if (plan === 'monthly') amount = 100;
    else if (plan === 'annual') amount = 1000;
    else return res.status(400).json({ message: 'Invalid plan' });

    try {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: { plan, userId: req.user.id }
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Something went wrong', error });
    }
});

router.post('/verify-payment', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Update User
        const startDate = new Date();
        let endDate = new Date();
        if (plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
        else if (plan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);

        await User.findByIdAndUpdate(req.user.id, {
            isSubscribed: true,
            plan: plan,
            subscriptionExpiresAt: endDate,
            $push: {
                paymentRecords: {
                    amount: plan === 'monthly' ? 100 : 1000,
                    status: 'paid',
                    date: new Date(),
                    confirmedBy: req.user.id
                }
            }
        });

        res.json({ status: 'success', message: 'Payment verified' });
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
});

module.exports = router;
