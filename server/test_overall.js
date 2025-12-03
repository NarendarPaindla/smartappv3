const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

dotenv.config();
connectDB();

const testOverall = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Testing Overall Summary Logic...');

        const users = await User.find({});
        console.log('Available Users:');
        for (const u of users) {
            const count = await Transaction.countDocuments({ user: u._id });
            console.log(`- ${u.email}: ${count} transactions`);
        }

        // Find a user with transactions
        const user = await User.findOne({ email: 'admin@smartspend.com' }) || users[0];
        console.log(`User: ${user.email} (${user._id})`);

        const transactions = await Transaction.find({ user: user._id });
        console.log(`Total Transactions: ${transactions.length}`);

        // Monthly Aggregation Logic (copied from summaryRoutes.js)
        const monthlyData = [];
        transactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
                const date = new Date(t.date);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const label = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

                const existing = monthlyData.find(d => d.key === key);
                if (existing) {
                    existing.amount += t.amount;
                } else {
                    monthlyData.push({ key, day: label, amount: t.amount });
                }
            });

        monthlyData.sort((a, b) => a.key.localeCompare(b.key));

        console.log('Monthly Data (Graph Data):');
        console.log(JSON.stringify(monthlyData, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testOverall();
