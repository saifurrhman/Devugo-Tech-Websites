const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Create contact submission
router.post('/', async (req, res) => {
  try {
    const { name, email, company, phone, website, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    const created = await Contact.create({ name, email, company, phone, website, budget, message });
    return res.status(201).json({ message: 'Submitted', contact: created });
  } catch (err) {
    console.error('Contact create error:', err.message);
    return res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// List contacts (simple, newest first). In real app, protect this route.
router.get('/', async (_req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 }).limit(500);
    return res.json({ items });
  } catch (err) {
    console.error('Contact list error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

module.exports = router;
