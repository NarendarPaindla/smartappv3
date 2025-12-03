const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const resetAdmin = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Resetting Admin Password...');

        const email = 'admin@smartspend.com';
        const password = 'edagali@100%';

        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found, creating...');
            user = await User.create({
                name: 'Admin User',
                email,
                password: password, // Pre-save hook will hash this
                defaultCurrency: '₹',
                role: 'admin'
            });
        } else {
            console.log('User found, updating password...');
            user.password = password; // Pre-save hook will hash this
            await user.save();
        }

        console.log('Password reset successfully.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetAdmin();
