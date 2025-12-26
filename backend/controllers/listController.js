const ContactList = require('../models/ContactList');
const Contact = require('../models/Contact');

// Get all lists
exports.list = async (req, res) => {
    try {
        const lists = await ContactList.find().sort({ createdAt: -1 });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new list
exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'List name is required' });

        const newList = new ContactList({ name, description });
        await newList.save();
        res.status(201).json(newList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a list
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await ContactList.findByIdAndDelete(id);

        // Remove this list reference from all contacts
        await Contact.updateMany(
            { lists: id },
            { $pull: { lists: id } }
        );

        res.json({ message: 'List deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add contacts to a list
exports.addContacts = async (req, res) => {
    try {
        const { id } = req.params;
        const { contactIds } = req.body; // Array of Contact IDs

        if (!Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(400).json({ message: 'No contacts provided' });
        }

        const list = await ContactList.findById(id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Update contacts to include this list
        await Contact.updateMany(
            { _id: { $in: contactIds }, lists: { $ne: id } }, // Only add if not already in list
            { $push: { lists: id } }
        );

        // Update count
        const count = await Contact.countDocuments({ lists: id });
        list.count = count;
        await list.save();

        res.json({ message: `Added ${contactIds.length} contacts to list`, count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get contacts in a list
exports.getContacts = async (req, res) => {
    try {
        const { id } = req.params;
        const contacts = await Contact.find({ lists: id }).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
