const { execSync } = require('child_process');

const tests = [
  { name: 'Utils', file: 'test-utils.js' },
  { name: 'Services', file: 'test-services.js' },
  { name: 'Validators', file: 'test-validators.js' },
  { name: 'Database', file: 'test-database.js' }
];

console.log('🚀 Running All Backend Tests...\n');
console.log('='.repeat(60));

let passedTests = 0;
let failedTests = 0;

tests.forEach((test, index) => {
  try {
    console.log(`\n[${index + 1}/${tests.length}] Testing: ${test.name}`);
    console.log('-'.repeat(60));
    
    execSync(`node ${test.file}`, { stdio: 'inherit' });
    
    console.log(`✅ ${test.name} - PASSED`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED`);
    failedTests++;
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary:');
console.log(`   Total: ${tests.length}`);
console.log(`   Passed: ${passedTests} ✅`);
console.log(`   Failed: ${failedTests} ❌`);
console.log('='.repeat(60));

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! Backend is working perfectly!');
} else {
  console.log('\n⚠️  Some tests failed. Check the output above for details.');
}
