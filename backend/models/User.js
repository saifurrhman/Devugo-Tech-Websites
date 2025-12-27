const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  password: {
    type: String,
    select: false // Transient field, not stored in DB
  },
  passwordHash: {
    type: String,
    select: false, // Don't include in queries by default
    required: function () {
      return !this.google && !this.linkedin;
    }
  },
  role: {
    type: String,
    enum: ['admin', 'email_marketing', 'crm', 'website_manager', 'blog_writer', 'editor', 'author', 'user'],
    default: 'user'
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
  // Invitation System
  invitationToken: String,
  invitationExpires: Date,
  // Password Reset OTP
  resetOTP: String,
  resetOTPExpires: Date,
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

// Don't return sensitive fields in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.password;
  return obj;
};

// ✅ PRE-SAVE HOOK - Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password field is modified or new
  if (!this.isModified('password')) {
    console.log('⏭️  Password not modified, skipping hash');
    return next();
  }

  // Skip if no password (OAuth users)
  if (!this.password) {
    console.log('⏭️  No password field, skipping hash');
    return next();
  }

  try {
    console.log('🔐 Pre-save: Hashing password for user:', this.email);
    console.log('   - Password length:', this.password.length);

    // Generate salt and hash
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.password, salt);

    console.log('✅ Pre-save: Password hashed successfully');
    console.log('   - PasswordHash length:', this.passwordHash?.length);

    // Clear the transient password field
    this.password = undefined;

  } catch (error) {
    console.error('❌ Error hashing password:', error);
    return next(error);
  }

  next();
});

// ✅ METHOD - Verify password
userSchema.methods.correctPassword = async function (candidatePassword) {
  console.log('🔍 correctPassword called');
  console.log('   - Has passwordHash:', !!this.passwordHash);
  console.log('   - PasswordHash length:', this.passwordHash?.length);
  console.log('   - Has candidatePassword:', !!candidatePassword);
  console.log('   - CandidatePassword length:', candidatePassword?.length);

  if (!this.passwordHash || !candidatePassword) {
    console.log('❌ Missing passwordHash or candidatePassword');
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.passwordHash);
    console.log('🔐 Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing passwords:', error);
    return false;
  }
};

// Alternative method name for compatibility
userSchema.methods.comparePassword = async function (candidatePassword) {
  return this.correctPassword(candidatePassword);
};

console.log('✅ User model loaded');

module.exports = mongoose.model('User', userSchema);