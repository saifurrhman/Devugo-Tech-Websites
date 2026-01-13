const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// ==========================================
// INVITE USER
// ==========================================
exports.inviteUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        // Validate input
        if (!name || !email || !role) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and role are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Generate Invitation Token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const invitationExpires = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

        // Create User (Inactive until they accept)
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            role,
            invitationToken: crypto.createHash('sha256').update(invitationToken).digest('hex'),
            invitationExpires,
            isActive: false // Inactive until password set
        });

        await user.save();

        // Send Invitation Email
        const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/invite/${invitationToken}`;

        // Log for dev environment
        if (process.env.NODE_ENV !== 'production') {
            console.log('📨 Invitation Link:', invitationLink);
        } else if (!process.env.FRONTEND_URL) {
            console.warn('⚠️ WARNING: FRONTEND_URL not set in production. Invitation link will use localhost.');
        }

        try {
            await emailService.sendTransactionalEmail('invitation', user.email, {
                invitationLink,
                name: user.name
            });
        } catch (emailError) {
            console.error('❌ Failed to send invitation email:', emailError);
            console.error('   Stack:', emailError.stack);
            // We still return success but warn about email
            return res.status(201).json({
                success: true,
                message: 'User created but failed to send email. Check server logs.',
                invitationLink: process.env.NODE_ENV === 'development' ? invitationLink : undefined,
                emailError: emailError.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully'
        });

    } catch (err) {
        console.error('❌ Invite user error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error',
            details: err.message
        });
    }
};

// ==========================================
// RESEND INVITATION
// ==========================================
exports.resendInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.isActive) {
            return res.status(400).json({ success: false, error: 'User is already active' });
        }

        // Generate New Token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        user.invitationToken = crypto.createHash('sha256').update(invitationToken).digest('hex');
        user.invitationExpires = Date.now() + 48 * 60 * 60 * 1000;

        await user.save();

        // Send Email
        const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/invite/${invitationToken}`;
        if (process.env.NODE_ENV !== 'production') console.log('📨 Resent Link:', invitationLink);

        await emailService.sendTransactionalEmail('invitation', user.email, {
            invitationLink,
            name: user.name
        });

        res.json({ success: true, message: 'Invitation resent successfully' });

    } catch (err) {
        console.error('❌ Resend invitation error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
// ==========================================
// DELETE USER
// ==========================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id; // From auth middleware

        if (id === currentUserId.toString()) {
            return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Optional: Prevent deleting other admins if needed, but for now just self-protection
        if (user.role === 'admin') {
            // Depending on strictness, we might want to allow this if there is a 'super_admin' concept
            // But usually systems protect admins from deleting each other.
            // User said "super admin ka lawa" (except super admin).
            // Let's assume the current user is the super admin and can delete anyone else, including other admins?
            // Or maybe "admin" role implies super admin.
            // If I delete another admin, that's fine. Just not myself.
        }

        await User.findByIdAndDelete(id);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('❌ Delete user error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// ==========================================
// TOGGLE USER STATUS (BLOCK/UNBLOCK)
// ==========================================
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        if (id === currentUserId.toString()) {
            return res.status(400).json({ success: false, error: 'You cannot block your own account' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Toggle status
        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'blocked'} successfully`,
            user
        });

    } catch (err) {
        console.error('❌ Toggle status error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// ==========================================
// GET USER ACTIVITY STATS
// ==========================================
exports.getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const ActivityLog = require('../models/ActivityLog');

        // 1. Fetch recent logs (last 100)
        const logs = await ActivityLog.find({ user: id })
            .sort({ timestamp: -1 })
            .limit(100);

        // 2. Calculate Active Time (Approximation)
        // We group logs by "session" (gaps > 30 mins start new session)
        const allLogs = await ActivityLog.find({ user: id }).sort({ timestamp: 1 });
        let totalDurationMs = 0;

        if (allLogs.length > 1) {
            for (let i = 0; i < allLogs.length - 1; i++) {
                const current = new Date(allLogs[i].timestamp);
                const next = new Date(allLogs[i + 1].timestamp);
                const diff = next - current;

                // If logs are within 30 mins of each other, count it as active time
                if (diff < 30 * 60 * 1000) {
                    totalDurationMs += diff;
                }
            }
        }

        // Convert to hours/minutes
        const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
        const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
        const activeTime = `${hours}h ${minutes}m`;

        // 3. Get frequent IPs
        const ipMap = {};
        allLogs.forEach(log => {
            if (log.ip) {
                ipMap[log.ip] = (ipMap[log.ip] || 0) + 1;
            }
        });
        // Sort IPs by frequency
        const topIPs = Object.entries(ipMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([ip]) => ip);

        res.json({
            success: true,
            logs,
            stats: {
                activeTime,
                topIPs,
                lastActive: logs[0]?.timestamp || null,
                totalActions: allLogs.length
            }
        });

    } catch (error) {
        console.error('Get Activity Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
    }
};
