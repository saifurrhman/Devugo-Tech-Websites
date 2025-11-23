const emailValidator = require('./utils/emailValidator');
const csvParser = require('./utils/csvParser');
const pagination = require('./utils/pagination');
const response = require('./utils/response');
const logger = require('./utils/logger');

console.log('🧪 Testing Utils...\n');

// Test Email Validator
console.log('1. ✉️  Email Validator:');
console.log('   Valid email:', emailValidator.isValidSyntax('test@gmail.com'));
console.log('   Invalid email:', emailValidator.isValidSyntax('invalid-email'));

// Test Pagination
console.log('\n2. 📄 Pagination:');
const paginationParams = pagination.getParams({ page: 2, limit: 10 });
console.log('   Params:', paginationParams);

// Test Logger
console.log('\n3. 📝 Logger:');
logger.info('Test info message');
logger.error('Test error message');

console.log('\n✅ Utils test complete!');