const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const listUsers = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const users = await User.find({});
        console.log('Total Users:', users.length);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [${u.role}] Plan: ${u.plan}, Usage: ${u.totalUsageMinutes}`);
        });
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
