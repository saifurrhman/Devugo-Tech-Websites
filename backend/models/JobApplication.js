const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema(
  {
    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
    },
    jobTitle: { type: String, required: true },
    // Applicant info
    fullName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, trim: true },
    linkedin:    { type: String, trim: true },
    portfolio:   { type: String, trim: true },
    resume:      { type: String }, // path to uploaded file
    coverLetter: { type: String },
    experience:  { type: String }, // years of experience
    status: {
      type: String,
      enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
