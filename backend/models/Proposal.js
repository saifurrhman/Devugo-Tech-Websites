const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    projectSource: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Rejected'],
      default: 'Draft',
    },
    paymentTerms: {
      type: String,
      default: 'Milestone-based',
    },
    content: {
      type: String,
      default: '',
    },
    validUntil: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', ProposalSchema);
