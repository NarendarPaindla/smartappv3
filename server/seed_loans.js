const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Loan = require('./models/Loan');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedLoans = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Find the admin user to attach loans to
        const user = await User.findOne({ email: 'admin@smartspend.com' });
        if (!user) {
            console.error('Admin user not found');
            process.exit(1);
        }

        await Loan.deleteMany({ user: user._id });

        const loans = [];
        for (let i = 1; i <= 8; i++) {
            loans.push({
                user: user._id,
                personName: `Borrower ${i}`,
                amount: 100 * i,
                dateGiven: new Date(),
                expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                interestAmount: 10 * i,
                status: 'active'
            });
        }

        await Loan.insertMany(loans);
        console.log('Seeded 8 loans for pagination test');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedLoans();
