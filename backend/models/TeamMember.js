const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema(
  {
    name: String,
    role: String,
    bio: String,
    avatar: String,
    socials: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
