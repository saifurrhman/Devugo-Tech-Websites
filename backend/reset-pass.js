require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const email = 'saifriaz34@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Resetting password for ${user.email}...`);
            user.password = '123456'; // Pre-save hook will hash this
            user.isActive = true; // Ensure active
            user.role = 'admin'; // Ensure admin

            await user.save();
            console.log('✅ Password reset to: 123456');
        } else {
            console.log('❌ User not found');
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
