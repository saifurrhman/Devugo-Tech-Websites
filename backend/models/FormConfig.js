const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // key used in payload
  label: { type: String, required: true },
  type: { type: String, enum: ['text','email','tel','textarea','select'], default: 'text' },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ label: String, value: String }], // for select
  order: { type: Number, default: 0 },
}, { _id: false });

const FormConfigSchema = new mongoose.Schema({
  key: { type: String, enum: ['contact','services'], required: true, unique: true },
  enabled: { type: Boolean, default: true },
  title: { type: String },
  subtitle: { type: String },
  buttonText: { type: String, default: 'Submit' },
  successMessage: { type: String, default: 'Thanks! Your message has been sent.' },
  notifyEmail: { type: String },
  fields: { type: [FieldSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('FormConfig', FormConfigSchema);
