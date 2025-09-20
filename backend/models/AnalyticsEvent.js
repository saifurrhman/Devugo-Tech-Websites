const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: String, // page_view, form_submit, social_click, etc.
    payload: Object,
    sessionId: String,
    ip: String,
    userAgent: String,
    referrer: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
