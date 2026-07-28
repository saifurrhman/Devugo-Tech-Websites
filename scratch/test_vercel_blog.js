fetch('https://devugo-tech-backend.vercel.app/api/blog', { method: 'GET' })
  .then(res => res.text().then(text => console.log("Blog GET:", res.status, text)))
  .catch(err => console.error(err));
