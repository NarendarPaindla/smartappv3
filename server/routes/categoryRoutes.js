const express = require('express');
const Category = require('../models/Category');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Add new category
// @route   POST /api/categories
// @access  Private
router.post('/', protect, async (req, res) => {
    const { name, type } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a category name');
    }

    try {
        const categoryExists = await Category.findOne({ user: req.user.id, name });

        if (categoryExists) {
            res.status(400);
            throw new Error('Category already exists');
        }

        const category = await Category.create({
            user: req.user.id,
            name,
            type: type || 'expense',
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }

        if (category.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await category.deleteOne();

        res.json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
