const mongoose = require('mongoose');

const ContactListSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    count: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if multi-user
}, { timestamps: true });

module.exports = mongoose.model('ContactList', ContactListSchema);
