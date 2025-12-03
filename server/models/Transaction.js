const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            required: true,
            enum: ['expense', 'income'],
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        category: {
            type: String,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        tags: [String],
        description: {
            type: String,
        },
        receiptImageUrl: {
            type: String,
        },
        extractedMerchant: {
            type: String,
        },
        extractedRawText: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
