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
// Allow configuring extra origins via env, e.g. CORS_ORIGINS="https://admin.example.com,https://www.example.com"
// Support both CORS_ORIGINS (comma-separated) and CORS_ORIGIN (single or comma-separated)
const extraOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN;
if (extraOrigins) {
  extraOrigins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(o => allowedOrigins.push(o));
}
const allowedOriginRegex = /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/;
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

// Health check: report MongoDB connection state and quick totals for debugging
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
app.get('/api/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const info = {
    dbState: state,
    dbStateText: states[state] || 'unknown',
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
  };
  try{
    const Service = require('./models/Service');
    const PricingPlan = require('./models/PricingPlan');
    const Portfolio = require('./models/Portfolio');
    const TeamMember = require('./models/TeamMember');
    const BlogPost = require('./models/BlogPost');
    const [services, pricing, portfolio, team, blogs] = await Promise.all([
      Service.countDocuments({}),
      PricingPlan.countDocuments({}),
      Portfolio.countDocuments({}),
      TeamMember.countDocuments({}),
      BlogPost.countDocuments({}),
    ]);
    info.totals = { services, pricing, portfolio, team, blogs };
  }catch(_e){ /* ignore in health */ }
  res.json(info);
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
// Portfolio Categories
const portfolioCategoryRoutes = require('./routes/portfolioCategories');
app.use('/api/portfolio-categories', portfolioCategoryRoutes);
// Tech Stack
const techStackRoutes = require('./routes/techStack');
app.use('/api/tech-stack', techStackRoutes);
// Client Reviews
const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);
// FAQs
const faqRoutes = require('./routes/faqs');
app.use('/api/faqs', faqRoutes);
// Forms (public + admin)
const formRoutes = require('./routes/forms');
app.use('/api/forms', formRoutes);
// Blog Categories
const blogCategoryRoutes = require('./routes/blogCategories');
app.use('/api/blog-categories', blogCategoryRoutes);
// Social Links
const socialLinkRoutes = require('./routes/socialLinks');
app.use('/api/social-links', socialLinkRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
