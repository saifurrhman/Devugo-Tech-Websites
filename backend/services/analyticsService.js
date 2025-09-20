// Placeholder analytics service
module.exports = {
  async capture(event) {
    console.log('Captured analytics event:', event);
  },
  async getMetrics() {
    return { visitors: 0, sources: [] };
  },
};
