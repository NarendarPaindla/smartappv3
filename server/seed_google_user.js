const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Loan = require('./models/Loan');
const Transaction = require('./models/Transaction');

dotenv.config();

const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedGoogleUser = async () => {
    try {
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Starting seed process...');

        const email = 'narendarreddypaindla@gmail.com';
        const password = 'Test@1234'; // Temporary password for verification
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. Create or Update User
        let user = await User.findOne({ email });
        if (user) {
            console.log('User exists, updating...');
            user.password = hashedPassword; // Ensure we can log in with password
            user.name = 'Narendar Reddy'; // Set a display name
            await user.save();
        } else {
            console.log('Creating new user...');
            user = await User.create({
                name: 'Narendar Reddy',
                email,
                password: hashedPassword,
                role: 'user', // Default role
                defaultCurrency: 'USD'
            });
        }

        console.log(`User ${email} ready.`);

        // 2. Clear existing data for this user
        await Loan.deleteMany({ user: user._id });
        await Transaction.deleteMany({ user: user._id });
        console.log('Cleared existing loans and transactions for user.');

        // 3. Seed Loans
        const loans = [
            { personName: 'Alice Johnson', amount: 5000, type: 'Given', status: 'Active', date: new Date('2024-10-01'), dueDate: new Date('2024-12-01'), description: 'Personal loan' },
            { personName: 'Bob Smith', amount: 2000, type: 'Taken', status: 'Paid', date: new Date('2024-09-15'), dueDate: new Date('2024-10-15'), description: 'Car repair' },
            { personName: 'Charlie Brown', amount: 1500, type: 'Given', status: 'Active', date: new Date('2024-11-05'), dueDate: new Date('2025-01-05'), description: 'Rent help' },
            { personName: 'David Wilson', amount: 3000, type: 'Taken', status: 'Active', date: new Date('2024-10-20'), dueDate: new Date('2024-12-20'), description: 'Medical bills' },
            { personName: 'Eve Davis', amount: 1000, type: 'Given', status: 'Paid', date: new Date('2024-08-10'), dueDate: new Date('2024-09-10'), description: 'Groceries' },
            { personName: 'Frank Miller', amount: 4500, type: 'Given', status: 'Active', date: new Date('2024-11-10'), dueDate: new Date('2025-02-10'), description: 'Business investment' },
            { personName: 'Grace Lee', amount: 2500, type: 'Taken', status: 'Paid', date: new Date('2024-07-01'), dueDate: new Date('2024-08-01'), description: 'Vacation' },
            { personName: 'Henry Ford', amount: 6000, type: 'Given', status: 'Active', date: new Date('2024-11-15'), dueDate: new Date('2025-05-15'), description: 'Home renovation' },
            { personName: 'Ivy Chen', amount: 1200, type: 'Taken', status: 'Active', date: new Date('2024-11-20'), dueDate: new Date('2024-12-20'), description: 'Laptop purchase' },
            { personName: 'Jack White', amount: 800, type: 'Given', status: 'Paid', date: new Date('2024-09-01'), dueDate: new Date('2024-09-15'), description: 'Concert tickets' },
        ];

        const loansWithUser = loans.map(loan => ({ ...loan, user: user._id }));
        await Loan.insertMany(loansWithUser);
        console.log(`Seeded ${loans.length} loans.`);

        // 4. Seed Transactions (for context)
        const transactions = [];
        const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health'];
        for (let i = 0; i < 30; i++) {
            transactions.push({
                user: user._id,
                amount: Math.floor(Math.random() * 100) + 10,
                category: categories[Math.floor(Math.random() * categories.length)],
                date: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)), // Last 60 days
                description: `Transaction ${i + 1}`,
                type: 'expense'
            });
        }
        await Transaction.insertMany(transactions);
        console.log(`Seeded ${transactions.length} transactions.`);

        console.log('Seed process completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedGoogleUser();
