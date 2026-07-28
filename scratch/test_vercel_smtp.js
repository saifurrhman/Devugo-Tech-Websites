fetch('https://devugo-tech-backend.vercel.app/api/settings/smtp', { method: 'GET' })
  .then(res => res.text().then(text => console.log("SMTP GET:", res.status, text)))
  .catch(err => console.error(err));
