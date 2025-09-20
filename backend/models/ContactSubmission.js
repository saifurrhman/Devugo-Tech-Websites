const mongoose = require('mongoose');

const ContactSubmissionSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    message: String,
    source: String, // attribution (social, campaign, referrer)
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactSubmission', ContactSubmissionSchema);
