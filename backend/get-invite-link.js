require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // Find the most recently created user who has an invitationToken
        const user = await User.findOne({
            invitationToken: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 });

        if (user) {
            console.log('✅ Found invited user:', user.email);

            // We cannot reverse the hash of the token, BUT...
            // Wait, the controller stores the HASH of the token in the DB:
            // invitationToken: crypto.createHash('sha256').update(invitationToken).digest('hex')
            // So I cannot get the original token from the DB to generate the link!

            // CRITICAL: The original token is ONLY known at the moment of creation (in the email).
            // If the email wasn't sent/logged, the token is LOST.

            // SOLUTION: I must generate a NEW token for this user and updating it in the DB, 
            // then print that new link.

            const crypto = require('crypto');
            const newToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(newToken).digest('hex');

            user.invitationToken = hashedToken;
            user.invitationExpires = Date.now() + 48 * 60 * 60 * 1000;
            await user.save();

            const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/invite/${newToken}`;
            console.log('\n🔗 HERE IS YOUR NEW INVITATION LINK:');
            console.log(link);
            console.log('\n(I generated a new token since the original one is hashed and unrecoverable)');

        } else {
            console.log('❌ No pending invitations found.');
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
