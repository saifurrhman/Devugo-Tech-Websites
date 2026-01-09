const http = require('http');

function testContactToInbox() {
    const payload = JSON.stringify({
        name: 'Test User ' + Date.now(),
        email: `test${Date.now()}@example.com`,
        message: 'This is a test message to verify Inbox routing.',
        source: 'Website Form'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    console.log('Sending payload:', payload);

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Response status:', res.statusCode);
            console.log('Response data:', data);

            if (res.statusCode === 201) {
                console.log('SUCCESS: Contact created.');
                console.log('Please check Admin Panel > Inbox to confirm a new message arrived.');
            } else {
                console.error('FAILURE: Unexpected status code.');
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error during test:', error);
    });

    req.write(payload);
    req.end();
}

testContactToInbox();
