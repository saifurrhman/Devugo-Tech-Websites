require('dotenv').config();
const mongoose = require('mongoose');
const blogAutomationJob = require('./jobs/blogAutomation');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");
    console.log("Triggering Blog Automation immediately...");
    
    // We override the time checking logic just for this manual trigger so it forces a run
    const Setting = require('./models/Setting');
    const setting = await Setting.findOne({ key: 'blogAutomation' });
    if (setting) {
      // Force it to think the current time matches a publish time
      const config = setting.value;
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      if (!config.publishTimes) config.publishTimes = [];
      if (!config.publishTimes.includes(currentTime)) {
         config.publishTimes.push(currentTime);
      }
      
      // Reset the last run for this time so it actually triggers
      config[`lastRun_${currentTime}`] = null;
      await Setting.findOneAndUpdate(
        { key: 'blogAutomation' },
        { $set: { value: config } }
      );
    }

    try {
        await blogAutomationJob.processAutomation();
        console.log("Automation finished successfully!");
    } catch(err) {
        console.error("Automation error:", err);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
