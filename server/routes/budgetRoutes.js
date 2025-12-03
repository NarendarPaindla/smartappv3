const express = require('express');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get budget for a specific month/year
// @route   GET /api/budgets
// @access  Private
router.get('/', protect, async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        res.status(400);
        throw new Error('Please provide month and year');
    }

    const budget = await Budget.findOne({
        user: req.user.id,
        month: Number(month),
        year: Number(year),
    });

    if (!budget) {
        return res.status(200).json(null);
    }

    res.status(200).json(budget);
});

// @desc    Create or update budget
// @route   POST /api/budgets
// @access  Private
router.post('/', protect, async (req, res) => {
    const { month, year, overallBudgetAmount, perCategoryBudgets } = req.body;

    if (!month || !year) {
        res.status(400);
        throw new Error('Please provide month and year');
    }

    let budget = await Budget.findOne({
        user: req.user.id,
        month: Number(month),
        year: Number(year),
    });

    if (budget) {
        // Update existing
        budget.overallBudgetAmount = overallBudgetAmount;
        budget.perCategoryBudgets = perCategoryBudgets;
        await budget.save();
        res.status(200).json(budget);
    } else {
        // Create new
        budget = await Budget.create({
            user: req.user.id,
            month,
            year,
            overallBudgetAmount,
            perCategoryBudgets,
        });
        res.status(201).json(budget);
    }
});

module.exports = router;
