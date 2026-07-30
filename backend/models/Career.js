const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'],
      default: 'Full-Time',
    },
    experience: {
      type: String,
      trim: true,
      default: 'Not specified',
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [
      {
        type: String,
        trim: true,
      }
    ],
    deadline: {
      type: Date,
    },
    applicationFields: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'file'], required: true },
        required: { type: Boolean, default: false },
        enabled: { type: Boolean, default: true },
        options: [String],
        isCustom: { type: Boolean, default: false }
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Career', CareerSchema);
