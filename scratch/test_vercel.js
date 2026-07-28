fetch('https://devugo-tech-backend.vercel.app/api/settings/ai', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
  .then(res => res.text().then(text => console.log("PUT:", res.status, text)))
  .catch(err => console.error(err));

fetch('https://devugo-tech-backend.vercel.app/api/settings/ai', { method: 'GET' })
  .then(res => res.text().then(text => console.log("GET:", res.status, text)))
  .catch(err => console.error(err));
