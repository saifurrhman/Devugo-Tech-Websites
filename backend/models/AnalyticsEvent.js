const mongoose = require('mongoose');
const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: String, 
    payload: Object,
    sessionId: String,
    ip: String,
    userAgent: String,
    referrer: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
