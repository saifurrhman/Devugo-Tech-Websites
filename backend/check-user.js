require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const email = 'saifriaz34@gmail.com';
        console.log(`Searching for user: ${email}`);

        try {
            const user = await User.findOne({ email }).select('+passwordHash');
            if (user) {
                console.log('✅ User found:', user.email);
                console.log('   - Role:', user.role);
                console.log('   - Has PasswordHash:', !!user.passwordHash);
                console.log('   - PasswordHash length:', user.passwordHash ? user.passwordHash.length : 0);
                console.log('   - Is Active:', user.isActive);
            } else {
                console.log('❌ User NOT found in database.');

                // Check case sensitivity
                const allUsers = await User.find({}, 'email');
                console.log('   - Available users:', allUsers.map(u => u.email));
            }
        } catch (e) {
            console.error('Query error:', e);
        }

        process.exit();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
