const http = require('http');

function listContacts() {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact', // No query params, simulating the new frontend call
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                const items = response.items || response;

                console.log(`Total Contacts Fetched: ${items.length}`);

                // key sources we want to see
                const sources = items.map(c => c.source);
                console.log('Sources found:', [...new Set(sources)]);

                const serviceLeads = items.filter(c => c.source === 'Services page' || c.source?.includes('Pricing'));
                if (serviceLeads.length > 0) {
                    console.log('SUCCESS: Service/Pricing leads are visible in the list.');
                    console.log('Example:', serviceLeads[0]);
                } else {
                    console.log('NOTE: No Service/Pricing leads found yet. Try submitting one from the frontend.');
                }

            } catch (e) {
                console.error('Error parsing response:', e);
            }
        });
    });

    req.on('error', e => console.error('Request error:', e));
    req.end();
}

listContacts();
