const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  passwordHash: {
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'editor', 'author'], 
    default: 'author' 
  },
  phone: String,
  avatar: String,
  lastLogin: Date
}, { 
  timestamps: true 
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);