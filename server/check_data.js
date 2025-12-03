const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Loan = require('./models/Loan');

dotenv.config();
connectDB();

const checkData = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Checking database content...');

        const userCount = await User.countDocuments();
        const loanCount = await Loan.countDocuments();

        console.log(`Total Users: ${userCount}`);
        console.log(`Total Loans: ${loanCount}`);

        const users = await User.find({}, 'email name');
        console.log('Users:', users);

        const loans = await Loan.find({}, 'personName amount user');
        console.log('Loans Sample:', loans.slice(0, 3));

        process.exit(0);
    } catch (error) {
        console.error('Error checking data:', error);
        process.exit(1);
    }
};

checkData();
