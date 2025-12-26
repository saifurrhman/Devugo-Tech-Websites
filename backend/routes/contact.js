const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Create contact submission
router.post('/', async (req, res) => {
  try {
    const { name, email, company, phone, website, budget, message, source } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    const created = await Contact.create({ name, email, company, phone, website, budget, message, source });
    return res.status(201).json({ message: 'Submitted', contact: created });
  } catch (err) {
    console.error('Contact create error:', err.message);
    return res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// List contacts with filtering
router.get('/', async (req, res) => {
  try {
    const { source } = req.query;
    const filter = {};

    // exact match for source if provided
    if (source) {
      filter.source = source;
    }

    const items = await Contact.find(filter).sort({ createdAt: -1 }).limit(500);
    return res.json({ items });
  } catch (err) {
    console.error('Contact list error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Bulk Import
router.post('/import', async (req, res) => {
  try {
    let contacts = [];
    let listId = null;

    // Handle both array (legacy) and object with listId
    if (Array.isArray(req.body)) {
      contacts = req.body;
    } else if (req.body.contacts && Array.isArray(req.body.contacts)) {
      contacts = req.body.contacts;
      listId = req.body.listId;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid data format. Expected array or { contacts, listId }.' });
    }

    let count = 0;
    const errors = [];
    const ContactList = require('../models/ContactList');

    for (const c of contacts) {
      try {
        if (!c.email) continue;

        // Check duplicate
        const exists = await Contact.findOne({ email: c.email });
        if (!exists) {
          // Defaults
          if (!c.status) c.status = 'Unverified';
          if (!c.source) c.source = 'Import';

          if (listId) {
            c.lists = [listId];
          }

          await Contact.create(c);
          count++;
        } else if (listId) {
          // If contact exists, ensure it's added to the list
          if (!exists.lists.includes(listId)) {
            exists.lists.push(listId);
            await exists.save();
            // We don't increment created count, but maybe we should track "updated" or "added to list" count?
            // For now, let's just ensure they are in the list.
          }
        }
      } catch (err) {
        errors.push({ email: c.email, error: err.message });
      }
    }

    // Update List Count if listId provided
    if (listId) {
      const listCount = await Contact.countDocuments({ lists: listId });
      await ContactList.findByIdAndUpdate(listId, { count: listCount });
    }

    return res.json({ success: true, count, errors });
  } catch (err) {
    console.error('Import error:', err.message);
    return res.status(500).json({ success: false, message: 'Import failed: ' + err.message });
  }
});

// Email Verification
// Simulate verification for now (Regex + DNS stub)
const dns = require('dns');

async function verifyEmail(email) {
  return new Promise((resolve) => {
    // 1. Syntax Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidSyntax = emailRegex.test(email);

    if (!isValidSyntax) {
      return resolve({
        email,
        status: 'invalid',
        overall_score: 0,
        is_safe_to_send: false,
        is_valid_syntax: false,
        is_disposable: false,
        mx_accepts_mail: false,
        can_connect_smtp: false,
        is_deliverable: false,
        details: 'Invalid syntax'
      });
    }

    // 2. Mock DNS/MX Check (since we can't reliably do port 25 checks without external IP rep)
    const domain = email.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
      const hasMx = !err && addresses && addresses.length > 0;

      // Heuristic scoring
      let score = hasMx ? 80 : 20;
      const isDisposable = ['tempmail.com', 'throwawaymail.com'].includes(domain);
      if (isDisposable) score = 0;

      resolve({
        email,
        status: hasMx ? 'valid' : 'invalid',
        overall_score: score,
        is_safe_to_send: score > 70,
        is_valid_syntax: true,
        is_disposable: isDisposable,
        is_role_account: ['admin', 'support', 'info'].includes(email.split('@')[0]),
        mx_accepts_mail: hasMx,
        mx_records: hasMx ? addresses[0].exchange : null,
        can_connect_smtp: hasMx,
        has_inbox_full: false,
        is_catch_all: false,
        is_deliverable: hasMx,
        is_disabled: false,
        is_free_email: ['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain)
      });
    });
  });
}

router.post('/verify-batch', async (req, res) => {
  try {
    const { emails } = req.body; // Array of email strings
    if (!emails || !Array.isArray(emails)) return res.status(400).json({ error: 'Emails array required' });

    const results = await Promise.all(emails.map(email => verifyEmail(email)));

    // Update contacts in DB if they exist
    for (const res of results) {
      if (res.is_safe_to_send) {
        await Contact.findOneAndUpdate({ email: res.email }, { status: 'Verified' });
      } else if (res.status === 'invalid') {
        await Contact.findOneAndUpdate({ email: res.email }, { status: 'Bounced' });
      }
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/verify', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const result = await verifyEmail(contact.email);

    // Update DB
    if (result.is_safe_to_send) {
      contact.status = 'Verified';
    } else {
      contact.status = 'Bounced'; // or 'Invalid'
    }
    await contact.save();

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Contact not found' });
    return res.json({ message: 'Contact deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
