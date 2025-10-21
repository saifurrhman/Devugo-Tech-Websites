const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String, 
    required: function() {
      // Only required if not using OAuth
      return !this.google && !this.linkedin;
    }
  },
  role: { 
    type: String, 
    enum: ['admin', 'editor', 'author', 'user'], 
    default: 'author' 
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // OAuth providers
  google: {
    id: String,
    email: String,
    name: String,
    picture: String
  },
  linkedin: {
    id: String,
    email: String,
    name: String,
    picture: String
  }
}, { 
  timestamps: true 
});

// Index for faster email queries
userSchema.index({ email: 1 });

// Don't return password hash in JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

console.log('✅ User model loaded');

module.exports = mongoose.model('User', userSchema);