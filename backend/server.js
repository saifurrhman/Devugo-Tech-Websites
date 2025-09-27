require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const allowedOriginRegex = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(cors({
  origin: function(origin, cb){
    if (!origin) return cb(null, true); // SSR or curl
    if (allowedOrigins.includes(origin) || allowedOriginRegex.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Handle preflight requests (fixed version)
app.options(/.*/, cors());

app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

// Default API route
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// Health check: report MongoDB connection state
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
app.get('/api/health', (_req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ dbState: state, dbStateText: states[state] || 'unknown' });
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const blogRoutes = require('./routes/blog');
app.use('/api/blog', blogRoutes);
const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);
const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);
const pricingRoutes = require('./routes/pricing');
app.use('/api/pricing', pricingRoutes);
const portfolioRoutes = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRoutes);
const teamRoutes = require('./routes/team');
app.use('/api/team', teamRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
