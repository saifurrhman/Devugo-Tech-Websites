fetch('https://devugo-tech-backend.vercel.app/api/debug-settings-error')
  .then(res => res.text().then(text => console.log(res.status, text)))
  .catch(err => console.error(err));
