const ExternalMetric = require('../models/ExternalMetric');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const ContactList = require('../models/ContactList');

// ==========================================
// STORE METRICS (e.g. Traffic)
// ==========================================
exports.storeMetrics = async (req, res) => {
    try {
        const { metric, value, meta, timestamp } = req.body;

        if (!metric || value === undefined) {
            return res.status(400).json({ success: false, error: 'Metric name and value are required' });
        }

        const newMetric = await ExternalMetric.create({
            metric,
            value,
            meta,
            timestamp: timestamp || new Date(),
            source: 'n8n'
        });

        res.status(201).json({ success: true, data: newMetric });

    } catch (err) {
        console.error('❌ n8n Metrics Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// AUTO-CREATE BLOG POST
// ==========================================
exports.createBlogPost = async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, authorEmail, image, status } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'Title and content are required' });
        }

        // Logic to find author or default
        // For now, we might need to find a user by email or use a system user
        // Assuming payload sends data ready for Blog model

        const newPost = await Blog.create({
            title,
            content,
            excerpt,
            category: category || 'General',
            tags: tags || [],
            image: image || '',
            status: status || 'draft',
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            authorName: 'AI Agent', // default
            published: status === 'published'
        });

        res.status(201).json({ success: true, post: newPost });

    } catch (err) {
        console.error('❌ n8n Blog Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// GET METRICS (For Dashboard Widget)
// ==========================================
exports.getMetrics = async (req, res) => {
    try {
        const { metric, limit = 30 } = req.query;
        const query = {};
        if (metric) query.metric = metric;

        const data = await ExternalMetric.find(query)
            .sort({ timestamp: -1 }) // Newest first
            .limit(parseInt(limit));

        // Return reversed (oldest first) for charts
        res.json({ success: true, data: data.reverse() });
    } catch (err) {
        console.error('❌ Get Metrics Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// SYNC CONTACTS
// ==========================================
exports.syncContacts = async (req, res) => {
    try {
        const { contacts, listName } = req.body; // contacts: [{ email, name, ... }]

        if (!Array.isArray(contacts)) {
            return res.status(400).json({ success: false, error: 'Contacts must be an array' });
        }

        // 1. Find or Create List
        let targetList = null;
        if (listName) {
            targetList = await ContactList.findOne({ name: listName });
            if (!targetList) {
                targetList = await ContactList.create({ name: listName, description: 'Created via n8n' });
            }
        }

        const results = { added: 0, updated: 0, failed: 0 };
        const processedIds = [];

        // 2. Process Contacts
        for (const c of contacts) {
            try {
                if (!c.email) continue;

                let contact = await Contact.findOne({ email: c.email });
                if (contact) {
                    // Update
                    Object.assign(contact, c);
                    await contact.save();
                    results.updated++;
                } else {
                    // Create
                    contact = await Contact.create(c);
                    results.added++;
                }

                processedIds.push(contact._id);

            } catch (e) {
                results.failed++;
            }
        }

        // 3. Add to list
        if (targetList && processedIds.length > 0) {
            // Add IDs to list.contacts (assuming array of ObjectIds)
            // Using $addToSet to avoid duplicates
            await ContactList.findByIdAndUpdate(targetList._id, {
                $addToSet: { contacts: { $each: processedIds } }
            });
        }

        res.json({ success: true, results, list: targetList?.name });

    } catch (err) {
        console.error('❌ n8n Contact Sync Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
