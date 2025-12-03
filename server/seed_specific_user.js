const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUser = async () => {
    try {
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        const email = 'commentreddy68@gmail.com';
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
        } else {
            await User.create({
                name: 'Test User',
                email,
                password: 'password123',
                defaultCurrency: 'USD',
            });
            console.log('User created:', email);
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUser();
