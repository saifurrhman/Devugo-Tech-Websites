const mongoose = require('mongoose');
const Career = require('./models/Career');
const JobApplication = require('./models/JobApplication');
const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

mongoose.connect('mongodb+srv://devugotech:devugotech34%40@devugotech.mpj2jkj.mongodb.net/DevugoTech?retryWrites=true&w=majority&appName=DevugoTech')
  .then(async () => {
    console.log('Connected to DB');
    const career = await Career.findOne({ isActive: true });
    if (!career) {
      console.log('No active careers found');
      process.exit(1);
    }
    
    await JobApplication.deleteOne({ email: 'test500@example.com' });

    const form = new FormData();
    form.append('careerId', career._id.toString());
    form.append('fullName', 'Test User');
    form.append('email', 'test500@example.com');
    // Simulate a file upload
    fs.writeFileSync('test-resume.pdf', 'dummy content');
    form.append('resume', fs.createReadStream('test-resume.pdf'));

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        process.exit(0);
      });
    });

    req.on('error', error => {
      console.error('Error:', error);
      process.exit(1);
    });

    form.pipe(req);
  });
