const http = require('http');

console.log('🚀 Checking Server Status...');

function check(path) {
    return new Promise((resolve) => {
        const req = http.request({ hostname: 'localhost', port: 5000, path: path, method: 'GET' }, (res) => {
            console.log(`✅ [${path}] Status: ${res.statusCode}`);
            res.resume();
            resolve();
        });
        req.on('error', (e) => {
            console.log(`❌ [${path}] Error: ${e.message}`);
            resolve();
        });
        req.end();
    });
}

(async () => {
    await check('/api/health'); // Check if server is up
    await check('/api/admin/users/123/activity'); // Check if route exists
})();
