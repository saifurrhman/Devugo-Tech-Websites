const emailService = require('./services/emailService');
const aiService = require('./services/aiService');

console.log('🧪 Testing Services...\n');

// Test Email Service
console.log('1. 📧 Email Service Available:', emailService.isAvailable());

// Test AI Service
console.log('2. 🤖 AI Service Configured:', aiService.isConfigured());

// Test Email Personalization
console.log('\n3. ✨ Email Personalization Test:');
const personalized = emailService.personalize('Hello {{firstName}} {{lastName}}!', {
  firstName: 'John',
  lastName: 'Doe'
});
console.log('   Result:', personalized);

// Test HTML to Text
console.log('\n4. 📝 HTML to Text Test:');
const text = emailService.stripHtml('<h1>Hello</h1><p>World</p>');
console.log('   Result:', text);

console.log('\n✅ Services test complete!');