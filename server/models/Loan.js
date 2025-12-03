const mongoose = require('mongoose');

const loanSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        personName: {
            type: String,
            required: [true, 'Please add a person name'],
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        dateGiven: {
            type: Date,
            required: [true, 'Please add the date given'],
        },
        expectedReturnDate: {
            type: Date,
            required: [true, 'Please add an expected return date'],
        },
        interestAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'paid'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Loan', loanSchema);
