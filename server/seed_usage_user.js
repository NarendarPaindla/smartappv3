const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUsageUser = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const email = 'usage_user@test.com';
        await User.deleteOne({ email });

        await User.create({
            name: 'Usage User',
            email,
            password: 'password123',
            role: 'user',
            plan: 'free',
            totalUsageMinutes: 120, // Used 2 hours
            isSubscribed: false,
            isActive: true
        });
        console.log('Usage User created:', email);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUsageUser();
