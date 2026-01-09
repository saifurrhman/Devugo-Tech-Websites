require('dotenv').config();
const mongoose = require('mongoose');
const CompanyInfo = require('../models/CompanyInfo');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        // Revert to reasonable defaults or what the user likely had
        const defaults = {
            companyName: 'Devugo Tech',
            tagline: 'We build modern websites, products and brands that people love.',
            phone: '+44 7542 958272',
            email: 'contact@devugo.tech',
            address: 'Vehari, Pakistan',
            whatsappNumber: '+44 7542 958272',
            whatsappMessage: 'Hello! I would like to discuss a project.',
            workingHours: 'Mon–Fri · 9am–6pm PKT',
            showWhatsappFloat: true // Restore toggle
        };

        await CompanyInfo.findOneAndUpdate({}, defaults, { upsert: true });
        console.log('✅ Reverted DB changes');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
