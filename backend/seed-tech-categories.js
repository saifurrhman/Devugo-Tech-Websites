require('dotenv').config();
const mongoose = require('mongoose');
const TechnologyCategory = require('./models/TechnologyCategory');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing from .env');
  process.exit(1);
}

const initialCategories = [
  { name: 'Frontend', order: 1 },
  { name: 'Backend', order: 2 },
  { name: 'Database', order: 3 },
  { name: 'AI & Automation', order: 4 },
  { name: 'DevOps', order: 5 },
  { name: 'CMS/E-commerce', order: 6 },
  { name: 'Other', order: 7 }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    let count = 0;
    for (const cat of initialCategories) {
      const exists = await TechnologyCategory.findOne({ name: cat.name });
      if (!exists) {
        await TechnologyCategory.create(cat);
        console.log(`Created category: ${cat.name}`);
        count++;
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log(`Finished. Created ${count} new categories.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding tech categories:', err);
    process.exit(1);
  }
}

seed();
