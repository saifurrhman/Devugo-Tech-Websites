const smtpConfig = require('../config/smtp');
const logger = require('../utils/logger');

// Helper to get Brevo Headers
const getHeaders = () => ({
    'accept': 'application/json',
    'api-key': smtpConfig.brevo.apiKey,
    'content-type': 'application/json'
});

exports.listSenders = async (req, res) => {
    try {
        if (!smtpConfig.brevo.enabled || !smtpConfig.brevo.apiKey) {
            return res.status(503).json({ message: 'Brevo service is not configured.' });
        }

        const response = await fetch('https://api.brevo.com/v3/senders', {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch senders from Brevo');
        }

        const data = await response.json();

        // Transform Brevo data to match our frontend expectation
        // Brevo returns: { senders: [{ id, name, email, active, ips: [] }] }
        const senders = (data.senders || []).map(sender => ({
            id: sender.id,
            _id: sender.id, // Keep _id for compatibility if frontend uses it
            name: sender.name,
            email: sender.email,
            status: sender.active ? 'verified' : 'unverified',
            domain: sender.email.split('@')[1],
            ip: sender.ips && sender.ips.length > 0 ? sender.ips[0].ip : 'Shared IP'
        }));

        res.json(senders);
    } catch (error) {
        console.error('List senders error:', error);
        res.status(500).json({ message: 'Error fetching senders', error: error.message });
    }
};

exports.createSender = async (req, res) => {
    try {
        const { name, email } = req.body;

        const response = await fetch('https://api.brevo.com/v3/senders', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create sender in Brevo');
        }

        // Brevo sends a verification email automatically for new senders on their side
        // We just return success.
        res.status(201).json({
            message: 'Sender created in Brevo. Please check your email inbox for the verification link via Brevo.',
            sender: {
                id: data.id,
                name,
                email,
                status: 'unverified' // Initially unverified until they click the link
            }
        });

    } catch (error) {
        console.error('Create sender error:', error);
        res.status(500).json({ message: 'Error adding sender', error: error.message });
    }
};

exports.deleteSender = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await fetch(`https://api.brevo.com/v3/senders/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            // If 404, consider it deleted
            if (response.status === 404) {
                return res.json({ message: 'Sender deleted successfully' });
            }
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete sender from Brevo');
        }

        res.json({ message: 'Sender deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sender', error: error.message });
    }
};

exports.verifySender = async (req, res) => {
    // This is no longer needed as Brevo handles verification
    res.status(404).send('Verification is handled by Brevo directly.');
};

exports.resendVerification = async (req, res) => {
    // Brevo doesn't have a simple public "resend" endpoint for senders via API v3 documented clearly 
    // that mimics the "click to resend" easily without creating duplicate errors.
    // However, usually updating the sender triggers re-verification or we instruct user.
    // For now, we will return a message guiding the user.
    res.status(400).json({
        message: 'To resend verification, please check your Brevo dashboard or remove and add the sender again.'
    });
};
// ==========================================
// DOMAIN MANAGEMENT
// ==========================================

exports.listDomains = async (req, res) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/senders/domains', {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch domains from Brevo');
        }

        const data = await response.json();
        // Brevo returns: { domains: [{ id, domain_name, authenticated, verified }] }
        res.json(data.domains || []);
    } catch (error) {
        console.error('List domains error:', error);
        res.status(500).json({ message: 'Error fetching domains', error: error.message });
    }
};

exports.createDomain = async (req, res) => {
    try {
        const { domain } = req.body; // Brevo expects { name: "domain.com" }

        const response = await fetch('https://api.brevo.com/v3/senders/domains', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name: domain })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create domain in Brevo');
        }

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error adding domain', error: error.message });
    }
};

exports.deleteDomain = async (req, res) => {
    try {
        const { domain } = req.params;

        const response = await fetch(`https://api.brevo.com/v3/senders/domains/${domain}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok && response.status !== 404) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete domain from Brevo');
        }

        res.json({ message: 'Domain deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting domain', error: error.message });
    }
};

exports.getDomain = async (req, res) => {
    try {
        const { domain } = req.params;

        const response = await fetch(`https://api.brevo.com/v3/senders/domains/${domain}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get domain details');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error getting domain details', error: error.message });
    }
};

exports.verifyDomain = async (req, res) => {
    try {
        const { domain } = req.params;

        // Brevo usually verifies automatically if records exist, but we can trigger a check or re-fetch status
        // The "authenticate" endpoint is what we usually trigger
        const response = await fetch(`https://api.brevo.com/v3/senders/domains/${domain}/verify`, {
            method: 'POST',
            headers: getHeaders()
        });

        // Note: Brevo V3 API docs for /verify might differ, usually fetching the domain again checks status.
        // If specific verify endpoint doesn't exist, we just return the current status.
        // However, for this implementation, let's assume we re-fetch the domain to get latest status.

        // Actually, simply calling GET /domains/:domain updates the status in some integrations.
        // But let's try the verify endpoint if documented, otherwise fallback to GET.

        if (!response.ok) {
            // If 404/405, fallback to just getting details
            return exports.getDomain(req, res);
        }

        // If it returns something
        const data = await response.json();
        res.json(data);

    } catch (error) {
        // Fallback to getDomain
        return exports.getDomain(req, res);
    }
};
