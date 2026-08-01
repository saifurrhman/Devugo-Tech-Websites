const mongoose = require('mongoose');

const searchRequestSchema = new mongoose.Schema({
    industry: { type: String, required: true },
    location: { type: String, required: true },
    sources: [{ type: String }],
    max_results: { type: Number, default: 20 },
    status: { type: String, enum: ['Pending', 'Running', 'Completed', 'Failed'], default: 'Running' },
    leads_found_count: { type: Number, default: 0 },
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    error_message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SearchRequest', searchRequestSchema);
