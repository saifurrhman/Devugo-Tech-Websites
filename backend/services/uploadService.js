// Placeholder upload service
module.exports = {
  async upload(fileBuffer, filename) {
    return { url: `https://placeholder.local/${filename}` };
  },
};
