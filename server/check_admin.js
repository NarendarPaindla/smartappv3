const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const checkAdmin = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const user = await User.findOne({ email: 'admin@smartspend.com' });
        if (user) {
            console.log('Admin User Found:', JSON.stringify(user, null, 2));
        } else {
            console.log('Admin User NOT Found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdmin();
