const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUser = async () => {
    try {
        const email = 'final@example.com';
        const password = 'password123';

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists. Updating password...');
            userExists.password = password;
            await userExists.save();
            console.log('User password updated.');
        } else {
            await User.create({
                name: 'Test User',
                email,
                password,
                defaultCurrency: 'USD',
            });
            console.log('User created.');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUser();
