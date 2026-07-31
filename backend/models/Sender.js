const mongoose = require('mongoose');

const senderSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['gmail_oauth', 'smtp', 'domain'], 
    required: true 
  },
  emailAddress: { 
    type: String, 
    required: true, 
    unique: true 
  },
  displayName: { 
    type: String, 
    required: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Gmail OAuth fields
  oauthRefreshToken: { type: String }, // Encrypted
  oauthAccessToken: { type: String },
  oauthTokenExpiry: { type: Date },
  
  // Custom SMTP fields
  smtpHost: { type: String },
  smtpPort: { type: Number },
  smtpUser: { type: String },
  smtpPass: { type: String }, // Encrypted
  smtpSecure: { type: Boolean, default: true },
  
  // Custom Domain relation
  domainId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Domain' 
  }
}, { timestamps: true });

// Prevent multiple defaults
senderSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('Sender', senderSchema);
