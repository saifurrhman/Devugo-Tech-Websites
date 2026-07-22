const Contact = require('../models/Contact');

exports.list = async (req, res) => {
    try {
        const { status, search, sort, days } = req.query;
        const filter = {};

        // Status Filter
        if (status && status !== 'all') {
            filter.status = new RegExp(`^${status}$`, 'i'); // Case insensitive
        }

        // Search (Name or Email)
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Date Range (for "Added in last X days")
        if (days) {
            const d = new Date();
            d.setDate(d.getDate() - parseInt(days));
            filter.createdAt = { $gte: d };
        }

        const contacts = await Contact.find(filter)
            .sort(sort ? { [sort]: -1 } : { createdAt: -1 })
            .limit(100); // Pagination recommended for future

        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.get = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ error: 'Contact not found' });
        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        // Check duplicate
        const existing = await Contact.findOne({ email: req.body.email });
        if (existing) {
            return res.status(400).json({ error: 'Contact with this email already exists' });
        }

        const contact = new Contact({
            ...req.body,
            status: 'New'
        });

        await contact.save();
        res.status(201).json(contact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(contact);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Handle Form Submission (Public)
exports.submit = async (req, res) => {
    try {
        // Public submissions usually don't have tags/status, set defaults
        const contact = new Contact({
            ...req.body,
            source: 'Website Form',
            status: 'New'
        });
        await contact.save();

        // Try to send email to Admin
        const emailService = require('../services/emailService');
        try {
            await emailService.sendEmail({
                to: process.env.ADMIN_EMAIL || 'devugo.tech@gmail.com',
                subject: `New Lead: ${contact.name}`,
                html: `
                    <h2>New Form Submission</h2>
                    <p><strong>Name:</strong> ${contact.name}</p>
                    <p><strong>Email:</strong> ${contact.email}</p>
                    <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
                    <p><strong>Service Requested:</strong> ${contact.service || 'N/A'}</p>
                    <p><strong>Message:</strong> ${contact.message || 'N/A'}</p>
                `,
                text: `New Form Submission\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || 'N/A'}\nMessage: ${contact.message || 'N/A'}`
            });
        } catch (emailErr) {
            console.error('Failed to send admin notification email:', emailErr);
        }

        res.status(201).json({ ok: true, message: 'Message sent successfully' });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
};
