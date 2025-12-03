const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get transactions
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { startDate, endDate, category, type, paymentMethod } = req.query;

        let query = { user: req.user.id };

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        if (category) {
            query.category = category;
        }

        if (type) {
            query.type = type;
        }

        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { description: searchRegex },
                { category: searchRegex },
                { extractedMerchant: searchRegex }
            ];
        }

        let transactionsQuery = Transaction.find(query).sort({ date: -1 });

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        transactionsQuery = transactionsQuery.skip(skip).limit(limit);

        const transactions = await transactionsQuery;
        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            transactions,
            page,
            totalPages: Math.ceil(total / limit),
            totalTransactions: total,
        });
    } catch (error) {
        res.status(500);
        throw new Error('Server Error');
    }
});

// @desc    Set transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', protect, async (req, res) => {
    const {
        type,
        amount,
        date,
        category,
        paymentMethod,
        tags,
        description,
        receiptImageUrl,
        extractedMerchant,
        extractedRawText,
    } = req.body;

    if (!type || !amount || !category || !paymentMethod) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const transaction = await Transaction.create({
        user: req.user.id,
        type,
        amount,
        date,
        category,
        paymentMethod,
        tags,
        description,
        receiptImageUrl,
        extractedMerchant,
        extractedRawText,
    });

    res.status(200).json(transaction);
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        res.status(400);
        throw new Error('Transaction not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the transaction user
    if (transaction.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).json(updatedTransaction);
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        res.status(400);
        throw new Error('Transaction not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the transaction user
    if (transaction.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await transaction.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = router;
