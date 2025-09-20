// Placeholder email service
module.exports = {
  async send(to, subject, html) {
    console.log('Email send (placeholder):', { to, subject });
    return true;
  },
};
