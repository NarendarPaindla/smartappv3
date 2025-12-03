const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Loan = require('../models/Loan');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new loan
// @route   POST /api/loans
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { personName, amount, dateGiven, expectedReturnDate, interestAmount } = req.body;

        if (!personName || !amount || !dateGiven || !expectedReturnDate) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const loan = await Loan.create({
            user: req.user.id,
            personName,
            amount,
            dateGiven,
            expectedReturnDate,
            interestAmount: interestAmount || 0,
        });

        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a loan
// @route   PUT /api/loans/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the loan user
        if (loan.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json(updatedLoan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a loan
// @route   DELETE /api/loans/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the loan user
        if (loan.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await loan.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
