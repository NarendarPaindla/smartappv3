const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUsers = async () => {
    try {
        // Wait for connection (hacky but simple for script)
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Starting seed...');

        const users = [
            {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                password: 'Password123!',
                role: 'user',
                isActive: true,
                isSubscribed: true,
                plan: 'monthly',
                totalUsageMinutes: 120,
                lastActive: new Date()
            },
            {
                name: 'Bob Smith',
                email: 'bob@example.com',
                password: 'Password123!',
                role: 'user',
                isActive: false,
                isSubscribed: false,
                plan: 'free',
                totalUsageMinutes: 45,
                lastActive: new Date(Date.now() - 86400000) // 1 day ago
            },
            {
                name: 'Charlie Brown',
                email: 'charlie@example.com',
                password: 'Password123!',
                role: 'user',
                isActive: true,
                isSubscribed: true,
                plan: 'annual',
                totalUsageMinutes: 5000,
                lastActive: new Date(Date.now() - 300000) // 5 mins ago
            }
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
                console.log(`Created user: ${u.name}`);
            } else {
                console.log(`User already exists: ${u.name}`);
            }
        }

        console.log('Seeding complete');
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
