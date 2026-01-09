const mongoose = require('mongoose');
const http = require('http');

// Simple script to test the route logic via HTTP request
const email = `test.subscriber.${Date.now()}@example.com`;

function submitNewsletter() {
    const data = JSON.stringify({
        name: 'Test Subscriber',
        email: email,
        source: 'Newsletter'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact', // The contact route handles the logic
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', async () => {
            console.log('Submission Status:', res.statusCode);
            console.log('Response:', body);

            if (res.statusCode === 201) {
                console.log('✅ Contact submitted successfully.');
                // Now verify via direct DB access (requires connection) or manual check
                // For this script, we'll just log success instructions
                console.log('👉 Please check backend logs or database to verify "Newsletter" list inclusion.');
            }
        });
    });

    req.on('error', error => {
        console.error('Error:', error);
    });

    req.write(data);
    req.end();
}

submitNewsletter();
