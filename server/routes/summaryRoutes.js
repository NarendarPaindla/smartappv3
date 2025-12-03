const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get monthly summary
// @route   GET /api/summary/monthly
// @access  Private
router.get('/monthly', protect, async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        res.status(400);
        throw new Error('Please provide month and year');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
        user: req.user.id,
        date: { $gte: startDate, $lte: endDate },
    });

    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const netSavings = totalIncome - totalExpense;

    // Category breakdown
    const categoryMap = {};
    transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
        name: cat,
        value: categoryMap[cat],
    }));

    // Highest spending category
    let highestCategory = { name: 'N/A', value: 0 };
    if (categoryBreakdown.length > 0) {
        highestCategory = categoryBreakdown.reduce((prev, current) =>
            prev.value > current.value ? prev : current
        );
    }

    // Daily spending
    const dailyMap = {};
    transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            const day = new Date(t.date).getDate();
            dailyMap[day] = (dailyMap[day] || 0) + t.amount;
        });

    const dailySpending = Object.keys(dailyMap).map((day) => ({
        day: Number(day),
        amount: dailyMap[day],
    }));

    // Payment method breakdown
    const paymentMap = {};
    transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            paymentMap[t.paymentMethod] = (paymentMap[t.paymentMethod] || 0) + t.amount;
        });

    const paymentMethodBreakdown = Object.keys(paymentMap).map((method) => ({
        name: method,
        value: paymentMap[method],
    }));

    res.status(200).json({
        totalIncome,
        totalExpense,
        netSavings,
        categoryBreakdown,
        highestCategory,
        dailySpending,
        paymentMethodBreakdown,
    });
});

// @desc    Get overall summary (all time)
// @route   GET /api/summary/overall
// @access  Private
router.get('/overall', protect, async (req, res) => {
    const transactions = await Transaction.find({
        user: req.user.id,
    });

    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const netSavings = totalIncome - totalExpense;

    // Category breakdown
    const categoryMap = {};
    transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
        name: cat,
        value: categoryMap[cat],
    }));

    // Highest spending category
    let highestCategory = { name: 'N/A', value: 0 };
    if (categoryBreakdown.length > 0) {
        highestCategory = categoryBreakdown.reduce((prev, current) =>
            prev.value > current.value ? prev : current
        );
    }

    // Monthly spending trend for overall view
    const monthlyData = [];
    transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

            const existing = monthlyData.find(d => d.key === key);
            if (existing) {
                existing.amount += t.amount;
            } else {
                monthlyData.push({ key, day: label, amount: t.amount });
            }
        });

    monthlyData.sort((a, b) => a.key.localeCompare(b.key));

    // Payment method breakdown
    const paymentMap = {};
    transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            paymentMap[t.paymentMethod] = (paymentMap[t.paymentMethod] || 0) + t.amount;
        });

    const paymentMethodBreakdown = Object.keys(paymentMap).map((method) => ({
        name: method,
        value: paymentMap[method],
    }));

    res.status(200).json({
        totalIncome,
        totalExpense,
        netSavings,
        categoryBreakdown,
        highestCategory,
        dailySpending: monthlyData,
        paymentMethodBreakdown,
    });
});

module.exports = router;
