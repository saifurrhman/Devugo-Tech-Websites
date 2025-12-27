const User = require('../models/User');
const Settings = require('../models/Settings');
const axios = require('axios');
const { google } = require('googleapis');

// Helper: Get Google OAuth Client from Settings
const getGoogleClient = async () => {
    const settings = await Settings.getSettings();
    const { clientId, clientSecret, redirectUri } = settings.google;

    if (!clientId || !clientSecret) {
        throw new Error('Google credentials not configured in Settings');
    }

    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/settings/integrations`
    );
};

// ==========================================
// 0. CONFIGURATION MANAGEMENT
// ==========================================

exports.updateCredentials = async (req, res) => {
    try {
        const { platform, clientId, clientSecret, redirectUri, personalToken } = req.body;
        const settings = await Settings.getSettings();

        if (platform === 'zoom') {
            settings.zoom = { clientId, clientSecret, redirectUri };
        } else if (platform === 'google') {
            settings.google = { clientId, clientSecret, redirectUri };
        } else if (platform === 'calendly') {
            settings.calendly = { personalToken };
        }

        await settings.save();
        res.json({ success: true, message: `${platform} credentials updated` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCredentialsStatus = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({
            success: true,
            zoom: {
                configured: !!(settings.zoom?.clientId && settings.zoom?.clientSecret),
                clientId: settings.zoom?.clientId
            },
            google: {
                configured: !!(settings.google?.clientId && settings.google?.clientSecret),
                clientId: settings.google?.clientId
            },
            calendly: {
                configured: !!settings.calendly?.personalToken
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 1. ZOOM INTEGRATION
// ==========================================

exports.zoomAuth = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        const { clientId, redirectUri } = settings.zoom;
        const uri = redirectUri || 'http://localhost:3000/admin/settings/integrations';

        const url = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${uri}`;
        res.json({ url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Frontend calls this to exchange code for token and save to DB
exports.connectZoom = async (req, res) => {
    try {
        const { code } = req.body;
        const settings = await Settings.getSettings();
        const { clientId, clientSecret, redirectUri } = settings.zoom;
        const uri = redirectUri || 'http://localhost:3000/admin/settings/integrations';

        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: uri
            },
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        });

        const { access_token, refresh_token } = response.data;

        await User.findByIdAndUpdate(req.user._id, {
            zoomAccessToken: access_token,
            zoomRefreshToken: refresh_token
        });

        res.json({ success: true, message: 'Zoom connected successfully' });

    } catch (error) {
        console.error('Connect Zoom Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to connect Zoom' });
    }
};

// ==========================================
// 2. GOOGLE CALENDAR INTEGRATION
// ==========================================

exports.googleAuth = async (req, res) => {
    try {
        const client = await getGoogleClient();
        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar']
        });
        res.json({ url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Frontend calls this to exchange code (received from frontend redirect)
exports.connectGoogle = async (req, res) => {
    try {
        const { code } = req.body;
        const client = await getGoogleClient();

        const { tokens } = await client.getToken(code);

        await User.findByIdAndUpdate(req.user._id, {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token // Only sent on first consent!
        });

        res.json({ success: true, message: 'Google Calendar connected successfully' });
    } catch (error) {
        console.error('Connect Google Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to connect Google' });
    }
};

// ==========================================
// 3. CALENDLY INTEGRATION
// ==========================================

exports.saveCalendly = async (req, res) => {
    try {
        const { token } = req.body;
        // User specific? Or Global? User requested "paste token"
        // Let's stick to User model for connection status, but we might store global API key if needed
        // For Personal Access Token it is usually per user.
        await User.findByIdAndUpdate(req.user._id, { calendlyToken: token });
        res.json({ success: true, message: 'Calendly connected successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. CREATE MEETING (UNIFIED)
// ==========================================

exports.createExternalMeeting = async (req, res) => {
    try {
        const { platform, topic, startTime, duration } = req.body;
        const user = await User.findById(req.user._id).select('+zoomAccessToken +googleAccessToken +googleRefreshToken +calendlyToken');

        let meetingData = {};

        if (platform === 'zoom') {
            if (!user.zoomAccessToken) throw new Error('Zoom not connected');

            const response = await axios.post(
                'https://api.zoom.us/v2/users/me/meetings',
                {
                    topic,
                    type: 2,
                    start_time: startTime, // ISO format
                    duration
                },
                { headers: { Authorization: `Bearer ${user.zoomAccessToken}` } }
            );

            meetingData = {
                joinUrl: response.data.join_url,
                password: response.data.password,
                id: response.data.id
            };

        } else if (platform === 'google') {
            if (!user.googleAccessToken) throw new Error('Google not connected');

            const client = getGoogleClient();
            client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });

            const calendar = google.calendar({ version: 'v3', auth: client });

            const endDateTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();

            const event = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: {
                    summary: topic,
                    start: { dateTime: startTime },
                    end: { dateTime: endDateTime }
                }
            });

            meetingData = {
                joinUrl: event.data.htmlLink,
                id: event.data.id
            };
        }

        res.json({ success: true, data: meetingData });

    } catch (error) {
        console.error('Create External Meeting Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+zoomAccessToken +googleAccessToken +calendlyToken');
        res.json({
            success: true,
            zoom: !!user.zoomAccessToken,
            google: !!user.googleAccessToken,
            calendly: !!user.calendlyToken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
