const http = require('http');

const data = JSON.stringify({
  careerId: '60d5ecb8b392d7001f3e3a12', // fake valid object id
  fullName: 'Test User',
  email: 'test@example.com'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/applications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();
