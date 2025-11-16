const mongoose = require('mongoose');

const CompanyInfoSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Devugo Tech' },
    tagline: { type: String, default: 'We build modern websites, products and brands that people love.' },
    phone: { type: String, default: '+92 300 123 4567' },
    email: { type: String, default: 'hello@devugo.tech' },
    address: { type: String, default: 'Lahore, Pakistan' },
    whatsappNumber: { type: String, default: '+923001234567' },
    whatsappMessage: { type: String, default: 'Hello! I would like to discuss a project.' },
    workingHours: { type: String, default: 'Mon–Fri · 9am–6pm PKT' },
    showWhatsappFloat: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyInfo', CompanyInfoSchema);