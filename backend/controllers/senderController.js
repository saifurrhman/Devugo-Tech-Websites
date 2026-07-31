const Sender = require('../models/Sender');
const { encrypt } = require('../utils/encryption');
const logger = require('../utils/logger');
// We will still keep smtpConfig for reference if needed, but not for Brevo anymore
const smtpConfig = require('../config/smtp');

exports.listSenders = async (req, res) => {
    try {
        const senders = await Sender.find().sort({ createdAt: -1 });
        
        // Map to match frontend expectations
        const mappedSenders = senders.map(s => ({
            _id: s._id,
            id: s._id,
            name: s.displayName,
            email: s.emailAddress,
            type: s.type,
            isDefault: s.isDefault,
            status: s.isVerified ? 'verified' : 'unverified',
            isVerified: s.isVerified,
            ip: s.type === 'smtp' ? s.smtpHost : 'Google IP'
        }));

        res.json(mappedSenders);
    } catch (error) {
        console.error('List senders error:', error);
        res.status(500).json({ message: 'Error fetching senders', error: error.message });
    }
};

exports.createSender = async (req, res) => {
    try {
        const { type, name, email, smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure } = req.body;

        if (!type || !name || !email) {
            return res.status(400).json({ message: 'Type, name, and email are required' });
        }

        let senderData = {
            type,
            displayName: name,
            emailAddress: email,
            isVerified: type === 'smtp' ? true : false, // Assume true for SMTP for now, could add validation later
        };

        if (type === 'smtp') {
            if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
                return res.status(400).json({ message: 'SMTP credentials are required for SMTP type' });
            }
            senderData.smtpHost = smtpHost;
            senderData.smtpPort = smtpPort;
            senderData.smtpUser = smtpUser;
            senderData.smtpPass = encrypt(smtpPass);
            senderData.smtpSecure = smtpSecure || true;
        }

        const sender = await Sender.create(senderData);

        res.status(201).json({
            message: 'Sender added successfully.',
            sender: {
                id: sender._id,
                name: sender.displayName,
                email: sender.emailAddress,
                status: sender.isVerified ? 'verified' : 'unverified',
                type: sender.type
            }
        });

    } catch (error) {
        console.error('Create sender error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Sender email already exists' });
        }
        res.status(500).json({ message: 'Error adding sender', error: error.message });
    }
};

exports.deleteSender = async (req, res) => {
    try {
        const { id } = req.params;
        const sender = await Sender.findByIdAndDelete(id);
        
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
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
const Domain = require('../models/Domain');
const crypto = require('crypto');
const dns = require('dns').promises;

exports.listDomains = async (req, res) => {
    try {
        const domains = await Domain.find().sort({ createdAt: -1 });
        
        const mappedDomains = domains.map(d => ({
            id: d._id,
            domain_name: d.domainName,
            authenticated: d.dkimVerified && d.spfVerified,
            dkim_status: d.dkimVerified,
            spf_status: d.spfVerified,
            dmarc_status: d.dmarcVerified
        }));
        
        res.json(mappedDomains);
    } catch (error) {
        console.error('List domains error:', error);
        res.status(500).json({ message: 'Error fetching domains', error: error.message });
    }
};

exports.createDomain = async (req, res) => {
    try {
        const { domain } = req.body; 

        if (!domain) {
            return res.status(400).json({ message: 'Domain name is required' });
        }

        // Generate 2048-bit RSA keys for DKIM
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        // Clean public key for DNS (remove PEM headers and newlines)
        const cleanPublicKey = publicKey
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\n/g, '');

        const dkimSelector = 'devugo';

        const newDomain = await Domain.create({
            domainName: domain,
            dkimSelector,
            dkimPublicKey: cleanPublicKey,
            dkimPrivateKey: encrypt(privateKey), // Encrypt private key before saving
            spfVerified: false,
            dkimVerified: false,
            dmarcVerified: false
        });

        res.status(201).json({
            id: newDomain._id,
            domain_name: newDomain.domainName
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Domain already exists' });
        }
        res.status(500).json({ message: 'Error adding domain', error: error.message });
    }
};

exports.deleteDomain = async (req, res) => {
    try {
        const { domain } = req.params; // Currently domain is passed by name from frontend

        const deletedDomain = await Domain.findOneAndDelete({ domainName: domain });
        
        if (!deletedDomain) {
            return res.status(404).json({ message: 'Domain not found' });
        }

        res.json({ message: 'Domain deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting domain', error: error.message });
    }
};

exports.getDomain = async (req, res) => {
    try {
        const { domain } = req.params;

        const d = await Domain.findOne({ domainName: domain });
        
        if (!d) {
            return res.status(404).json({ message: 'Domain not found' });
        }

        // Construct DNS records that the frontend needs to show
        const dnsRecords = {
            domain_name: d.domainName,
            authenticated: d.dkimVerified && d.spfVerified,
            dkim_status: d.dkimVerified,
            spf_status: d.spfVerified,
            dmarc_status: d.dmarcVerified,
            dns_records: {
                dkim: {
                    host: `${d.dkimSelector}._domainkey.${d.domainName}`,
                    type: 'TXT',
                    value: `v=DKIM1; k=rsa; p=${d.dkimPublicKey}`,
                    status: d.dkimVerified
                },
                spf: {
                    host: d.domainName,
                    type: 'TXT',
                    value: `v=spf1 include:_spf.devugo.tech ~all`, // Example SPF, adjust as needed
                    status: d.spfVerified
                },
                dmarc: {
                    host: `_dmarc.${d.domainName}`,
                    type: 'TXT',
                    value: `v=DMARC1; p=none; rua=mailto:dmarc@devugo.tech`,
                    status: d.dmarcVerified
                }
            }
        };

        res.json(dnsRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error getting domain details', error: error.message });
    }
};

exports.verifyDomain = async (req, res) => {
    try {
        const { domain } = req.params;
        const d = await Domain.findOne({ domainName: domain });

        if (!d) return res.status(404).json({ message: 'Domain not found' });

        let spfVerified = false;
        let dkimVerified = false;
        let dmarcVerified = false;

        // 1. Verify SPF
        try {
            const spfRecords = await dns.resolveTxt(domain);
            const hasSpf = spfRecords.some(r => r.join('').includes('v=spf1') && r.join('').includes('include:_spf.devugo.tech'));
            if (hasSpf) spfVerified = true;
        } catch (e) { /* ignore */ }

        // 2. Verify DKIM
        try {
            const dkimRecords = await dns.resolveTxt(`${d.dkimSelector}._domainkey.${domain}`);
            const hasDkim = dkimRecords.some(r => r.join('').includes(`p=${d.dkimPublicKey}`));
            if (hasDkim) dkimVerified = true;
        } catch (e) { /* ignore */ }

        // 3. Verify DMARC
        try {
            const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
            const hasDmarc = dmarcRecords.some(r => r.join('').includes('v=DMARC1'));
            if (hasDmarc) dmarcVerified = true;
        } catch (e) { /* ignore */ }

        // Update DB
        d.spfVerified = spfVerified;
        d.dkimVerified = dkimVerified;
        d.dmarcVerified = dmarcVerified;
        if (spfVerified && dkimVerified && dmarcVerified && !d.verifiedAt) {
            d.verifiedAt = new Date();
        }
        await d.save();

        res.json({ message: 'Verification complete', result: { spfVerified, dkimVerified, dmarcVerified } });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying domain', error: error.message });
    }
};
