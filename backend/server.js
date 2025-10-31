require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

require('./config/passport')();
const app = express();

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// Body parser with increased limit for image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'devugo-tech-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await require('./models/User').findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// Allow configuring extra origins via env
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

// Handle preflight requests
app.use(function(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).send();
  }
  next();
});

app.use(cookieParser());

// =============================================================================
// STATIC FILES & UPLOAD DIRECTORY (NEW - FOR IMAGE UPLOADS)
// =============================================================================

// Static files serve karein - uploaded images access ke liye
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static('public'));

// Upload directory create karein agar exist nahi karti
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created:', uploadDir);
}

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000,          // 45 seconds
})
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB connection fails
  });

// =============================================================================
// API ROUTES
// =============================================================================

// Default API route
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// Health check route
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

// =============================================================================
// ALL ROUTES
// =============================================================================

// Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Blog routes
const blogRoutes = require('./routes/blog');
app.use('/api/blog', blogRoutes);

// Contact routes
const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

// Analytics routes
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

// Upload routes (existing)
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

// Image upload routes (NEW!)
const imageRoutes = require('./routes/imageRoutes');
app.use('/api/images', imageRoutes);

// Service routes
const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);

// Pricing routes
const pricingRoutes = require('./routes/pricing');
app.use('/api/pricing', pricingRoutes);

// Portfolio routes
const portfolioRoutes = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRoutes);

// Team routes
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

// =============================================================================
// ERROR HANDLING MIDDLEWARE (NEW - FOR MULTER ERRORS)
// =============================================================================

// Multer error handling for image uploads
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer specific errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size bohat bari hai! Maximum 5MB allowed hai.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Bohat zyada files select ki hain!'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in form data!'
      });
    }
  }

  // File type error (from multer fileFilter)
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Pass to next error handler if not multer error
  next(err);
});

// =============================================================================
// SERVER START
// =============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📁 Upload Directory: ${uploadDir}`);
  console.log(`✅ All routes mounted successfully`);
  console.log('='.repeat(60));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});