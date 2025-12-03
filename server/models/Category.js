const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String, // 'income' or 'expense' - optional, can be generic
            default: 'expense',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure unique category names per user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
