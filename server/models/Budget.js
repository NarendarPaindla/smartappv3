const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        month: {
            type: Number,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        overallBudgetAmount: {
            type: Number,
            default: 0,
        },
        perCategoryBudgets: [
            {
                category: { type: String, required: true },
                amount: { type: Number, required: true },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
