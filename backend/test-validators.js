const emailValidator = require('./utils/emailValidator');

console.log('🧪 Testing Validators...\n');

// Test Email Validation
console.log('1. ✉️  Email Validation:');
const validEmail = emailValidator.validate('john.doe@gmail.com');
console.log('   Valid email test:', validEmail.isValid ? '✅ PASS' : '❌ FAIL');

const invalidEmail = emailValidator.validate('invalid-email');
console.log('   Invalid email test:', !invalidEmail.isValid ? '✅ PASS' : '❌ FAIL');
console.log('   Errors:', invalidEmail.errors);

// Test Disposable Email
console.log('\n2. 🚫 Disposable Email Check:');
const disposable = emailValidator.isDisposable('test@tempmail.com');
console.log('   Tempmail detected:', disposable ? '✅ PASS' : '❌ FAIL');

const legitimate = emailValidator.isDisposable('test@gmail.com');
console.log('   Gmail not disposable:', !legitimate ? '✅ PASS' : '❌ FAIL');

// Test Email Sanitization
console.log('\n3. 🧹 Email Sanitization:');
const sanitized = emailValidator.sanitize('  TEST@GMAIL.COM  ');
console.log('   Original: "  TEST@GMAIL.COM  "');
console.log('   Sanitized:', sanitized);
console.log('   Test:', sanitized === 'test@gmail.com' ? '✅ PASS' : '❌ FAIL');

console.log('\n✅ Validator test complete!');
