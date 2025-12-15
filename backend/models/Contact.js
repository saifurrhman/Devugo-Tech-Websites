const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  company: { type: String, trim: true },
  phone: { type: String, trim: true },
  website: { type: String, trim: true },
  budget: { type: String, trim: true },
  message: { type: String, required: false, trim: true }, // Message not always required for imported contacts
  source: { type: String, trim: true, default: 'Manual' },

  // CRM Fields
  status: {
    type: String,
    enum: ['New', 'Verified', 'Unverified', 'Bounced', 'Unsubscribed'],
    default: 'New'
  },
  tags: [{ type: String, trim: true }],
  stats: {
    emailsSent: { type: Number, default: 0 },
    emailsOpened: { type: Number, default: 0 },
    emailsClicked: { type: Number, default: 0 }
  },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

// Virtuals for rates
ContactSchema.virtual('openRate').get(function () {
  if (!this.stats.emailsSent) return 0;
  return Math.round((this.stats.emailsOpened / this.stats.emailsSent) * 100);
});

ContactSchema.virtual('clickRate').get(function () {
  if (!this.stats.emailsSent) return 0;
  return Math.round((this.stats.emailsClicked / this.stats.emailsSent) * 100);
});

ContactSchema.set('toJSON', { virtuals: true });
ContactSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contact', ContactSchema);
