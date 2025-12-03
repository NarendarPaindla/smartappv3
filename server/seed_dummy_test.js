const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Loan = require('./models/Loan');

dotenv.config();
connectDB();

const seedDummyUser = async () => {
    try {
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Starting dummy user seed...');

        const email = 'dummy_test@example.com';
        const password = 'Dummy@1234';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. Create or Update User
        let user = await User.findOne({ email });
        if (user) {
            console.log('Updating existing dummy user...');
            user.password = hashedPassword;
            user.name = 'Dummy Tester';
            await user.save();
        } else {
            console.log('Creating new dummy user...');
            user = await User.create({
                name: 'Dummy Tester',
                email,
                password: hashedPassword,
                role: 'user',
                defaultCurrency: 'USD'
            });
        }

        console.log(`User ${email} ready.`);

        // 2. Clear existing data
        await Loan.deleteMany({ user: user._id });
        console.log('Cleared existing loans.');

        // 3. Seed Loans
        const loans = [
            { personName: 'John Doe', amount: 5000, type: 'Given', status: 'active', dateGiven: new Date('2024-10-01'), expectedReturnDate: new Date('2024-12-01'), interestAmount: 200 },
            { personName: 'Jane Smith', amount: 2000, type: 'Taken', status: 'paid', dateGiven: new Date('2024-09-15'), expectedReturnDate: new Date('2024-10-15'), interestAmount: 100 },
            { personName: 'Bob Brown', amount: 1500, type: 'Given', status: 'active', dateGiven: new Date('2024-11-05'), expectedReturnDate: new Date('2025-01-05'), interestAmount: 50 },
            { personName: 'Alice White', amount: 3000, type: 'Taken', status: 'active', dateGiven: new Date('2024-10-20'), expectedReturnDate: new Date('2024-12-20'), interestAmount: 150 },
            { personName: 'Charlie Green', amount: 1000, type: 'Given', status: 'paid', dateGiven: new Date('2024-08-10'), expectedReturnDate: new Date('2024-09-10'), interestAmount: 20 },
            { personName: 'David Black', amount: 4500, type: 'Given', status: 'active', dateGiven: new Date('2024-11-10'), expectedReturnDate: new Date('2025-02-10'), interestAmount: 250 },
            { personName: 'Eva Blue', amount: 2500, type: 'Taken', status: 'paid', dateGiven: new Date('2024-07-01'), expectedReturnDate: new Date('2024-08-01'), interestAmount: 120 },
            { personName: 'Frank Red', amount: 6000, type: 'Given', status: 'active', dateGiven: new Date('2024-11-15'), expectedReturnDate: new Date('2025-05-15'), interestAmount: 300 },
            { personName: 'Grace Yellow', amount: 1200, type: 'Taken', status: 'active', dateGiven: new Date('2024-11-20'), expectedReturnDate: new Date('2024-12-20'), interestAmount: 60 },
            { personName: 'Harry Purple', amount: 800, type: 'Given', status: 'paid', dateGiven: new Date('2024-09-01'), expectedReturnDate: new Date('2024-09-15'), interestAmount: 40 },
        ];

        const loansWithUser = loans.map(loan => ({ ...loan, user: user._id }));
        await Loan.insertMany(loansWithUser);
        console.log(`Seeded ${loans.length} loans.`);

        console.log('Seed process completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedDummyUser();
