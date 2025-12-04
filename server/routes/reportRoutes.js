const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get report summary
// @route   GET /api/reports/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
    // Re-use transaction filtering logic or create specific aggregation
    // For simplicity, we'll fetch filtered transactions and aggregate in memory or use Mongo aggregation
    // This endpoint is similar to GET /transactions but returns aggregated data
    try {
        const { startDate, endDate, category, type, paymentMethod } = req.query;

        let query = { user: req.user.id };

        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: new Date(startDate), $lte: end };
        }
        if (category) query.category = category;
        if (type) query.type = type;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        const transactions = await Transaction.find(query);

        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const netResult = totalIncome - totalExpense;

        res.status(200).json({
            transactions,
            totalIncome,
            totalExpense,
            netResult,
        });
    } catch (error) {
        res.status(500);
        throw new Error('Server Error');
    }
});

// @desc    Export report as CSV
// @route   GET /api/reports/export/csv
// @access  Private
router.get('/export/csv', protect, async (req, res) => {
    const { startDate, endDate, category, type, paymentMethod } = req.query;

    let query = { user: req.user.id };

    if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) query.category = category;
    if (type) query.type = type;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Manual CSV generation
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = transactions.map(t => [
        new Date(t.date).toISOString().split('T')[0],
        t.type,
        t.category,
        t.amount,
        t.paymentMethod,
        `"${t.description || ''}"` // Escape description
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions_report.csv');
    res.send(csvContent);
});

module.exports = router;
