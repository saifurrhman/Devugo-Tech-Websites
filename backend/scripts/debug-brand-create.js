const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

async function testCreate() {
    try {
        console.log('🔄 Testing Brand Creation...');

        // Mock Data
        const brandData = {
            name: 'Debug Brand',
            logo: 'https://via.placeholder.com/150',
            url: 'https://example.com',
            isActive: true
        };

        // Logic from controller
        const last = await Brand.findOne().sort({ order: -1 });
        const order = (last?.order || 0) + 1;

        const brand = await Brand.create({
            ...brandData,
            order
        });

        console.log('✅ Brand Created Successfully:', brand);
    } catch (err) {
        console.error('❌ Brand Creation Failed:', err);
    } finally {
        // Cleanup
        try {
            await Brand.deleteOne({ name: 'Debug Brand' });
            console.log('🧹 Cleanup done');
        } catch (e) {
            console.error('Cleanup failed');
        }
        mongoose.connection.close();
    }
}

testCreate();
