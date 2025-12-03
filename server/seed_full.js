const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Loan = require('./models/Loan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Starting seed process...');

        const email = 'admin@smartspend.com';
        const password = 'edagali@100%';

        // 1. Setup Admin User
        let user = await User.findOne({ email });
        if (user) {
            console.log('Updating existing admin user...');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
        } else {
            console.log('Creating new admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = await User.create({
                name: 'Admin User',
                email,
                password: hashedPassword,
                defaultCurrency: '₹',
                role: 'admin' // Assuming you have roles
            });
        }

        // 2. Clear existing data for this user
        await Transaction.deleteMany({ user: user._id });
        await Loan.deleteMany({ user: user._id });
        console.log('Cleared existing data for admin user.');

        // 3. Seed Transactions (Last 2 months)
        const transactions = [];
        const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Salary', 'Freelance'];
        const types = ['expense', 'expense', 'expense', 'expense', 'expense', 'expense', 'income', 'income']; // Weighted towards expense

        for (let i = 0; i < 50; i++) {
            const daysAgo = Math.floor(Math.random() * 60);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const typeIndex = Math.floor(Math.random() * types.length);
            const type = types[typeIndex];
            const category = categories[typeIndex];
            const amount = Math.floor(Math.random() * 5000) + 100;

            transactions.push({
                user: user._id,
                type,
                category,
                amount,
                date,
                description: `Sample ${type} for ${category}`,
                paymentMethod: 'Cash'
            });
        }
        await Transaction.insertMany(transactions);
        console.log(`Seeded ${transactions.length} transactions.`);

        // 4. Seed Loans
        const loans = [];
        // Active Loans
        for (let i = 1; i <= 8; i++) {
            loans.push({
                user: user._id,
                personName: `Borrower ${i}`,
                amount: 1000 * i,
                dateGiven: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // i days ago
                expectedReturnDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // in 30 days
                interestAmount: 50 * i,
                status: 'active'
            });
        }
        // Paid Loans
        for (let i = 9; i <= 12; i++) {
            loans.push({
                user: user._id,
                personName: `Paid Borrower ${i}`,
                amount: 500 * i,
                dateGiven: new Date(Date.now() - (60 * 24 * 60 * 60 * 1000)),
                expectedReturnDate: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)),
                interestAmount: 25 * i,
                status: 'paid'
            });
        }
        await Loan.insertMany(loans);
        console.log(`Seeded ${loans.length} loans.`);

        console.log('Seed process completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seedData();
