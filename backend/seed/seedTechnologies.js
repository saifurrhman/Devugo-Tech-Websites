require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Technology = require('../models/Technology');

const seedData = [
  { name: 'React', category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', description: 'A JavaScript library for building user interfaces', proficiencyLevel: 95, websiteUrl: 'https://react.dev', featured: true, order: 0 },
  { name: 'Node.js', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', description: 'JavaScript runtime built on Chrome\'s V8 engine', proficiencyLevel: 90, websiteUrl: 'https://nodejs.org', featured: true, order: 1 },
  { name: 'Express', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', description: 'Fast, unopinionated, minimalist web framework for Node.js', proficiencyLevel: 90, websiteUrl: 'https://expressjs.com', featured: false, order: 2 },
  { name: 'MongoDB', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', description: 'A document-based, distributed database', proficiencyLevel: 90, websiteUrl: 'https://www.mongodb.com', featured: true, order: 3 },
  { name: 'MySQL', category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', description: 'Open-source relational database management system', proficiencyLevel: 80, websiteUrl: 'https://www.mysql.com', featured: false, order: 4 },
  { name: 'Python', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', description: 'High-level programming language for general-purpose programming', proficiencyLevel: 85, websiteUrl: 'https://www.python.org', featured: true, order: 5 },
  { name: 'Flask', category: 'Backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg', description: 'A lightweight WSGI web application framework', proficiencyLevel: 75, websiteUrl: 'https://flask.palletsprojects.com/', featured: false, order: 6 },
  { name: 'OpenAI API', category: 'AI & Automation', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg', description: 'Powerful AI models for advanced language generation and processing', proficiencyLevel: 85, websiteUrl: 'https://openai.com', featured: true, order: 7 },
  { name: 'n8n', category: 'AI & Automation', icon: 'https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png', description: 'Workflow automation tool', proficiencyLevel: 80, websiteUrl: 'https://n8n.io', featured: true, order: 8 },
  { name: 'WordPress', category: 'CMS/E-commerce', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg', description: 'Open source software you can use to create a beautiful website', proficiencyLevel: 95, websiteUrl: 'https://wordpress.org', featured: false, order: 9 },
  { name: 'WooCommerce', category: 'CMS/E-commerce', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/woocommerce/woocommerce-original.svg', description: 'Customizable, open-source eCommerce platform built on WordPress', proficiencyLevel: 90, websiteUrl: 'https://woocommerce.com', featured: false, order: 10 },
  { name: 'JWT', category: 'Other', icon: 'https://jwt.io/img/pic_logo.svg', description: 'JSON Web Tokens for secure authorization', proficiencyLevel: 90, websiteUrl: 'https://jwt.io', featured: false, order: 11 },
  { name: 'Git/GitHub', category: 'DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', description: 'Version control system and code hosting platform', proficiencyLevel: 90, websiteUrl: 'https://github.com', featured: false, order: 12 },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Clearing existing technologies...');
    await Technology.deleteMany({});
    
    console.log('Inserting seed data...');
    for (const data of seedData) {
      await Technology.create(data);
    }
    
    console.log('Successfully seeded technologies database!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
