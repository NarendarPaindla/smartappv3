const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedAdmin = async () => {
    try {
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        const email = 'admin@smartspend.com';
        const user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            user.password = 'edagali@100%'; // Will be hashed by pre-save hook
            user.isActive = true;
            await user.save();
            console.log('Admin user updated:', email);
        } else {
            await User.create({
                name: 'Admin User',
                email,
                password: 'edagali@100%',
                role: 'admin',
                defaultCurrency: 'USD',
                isActive: true
            });
            console.log('Admin user created:', email);
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
