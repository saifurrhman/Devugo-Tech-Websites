require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');

const uri = process.env.MONGO_URI;
console.log('Connecting to:', uri.split('@')[1]); // Log partial URI for safety

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected!');

        // 1. Create
        const email = `test-${Date.now()}@test.com`;
        console.log('Creating contact:', email);
        await Contact.create({
            name: 'Test Script',
            email: email,
            source: 'Import',
            status: 'Unverified'
        });
        console.log('Created.');

        // 2. Fetch
        const found = await Contact.findOne({ email: email });
        console.log('Found created contact:', found ? found.source : 'Not Found');

        // 3. List recent imports
        const list = await Contact.find({ source: 'Import' }).sort({ createdAt: -1 }).limit(5);
        console.log('Recent Imports in DB:', list.length);
        list.forEach(c => console.log(`- ${c.name} (${c.email}) [${c.source}]`));

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
