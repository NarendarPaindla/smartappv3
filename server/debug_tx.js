const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const txs = await Transaction.find({}).sort({ date: -1 });
    console.log('Current Time:', new Date().toISOString());
    console.log('Transactions:');
    txs.forEach(t => {
        console.log(`ID: ${t._id}, Date: ${t.date.toISOString()}, Category: ${t.category}, Amount: ${t.amount}`);
    });
    process.exit();
});
