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

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'devugo-tech-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
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

// =============================================================================
// CORS CONFIGURATION - VERCEL COMPATIBLE
// =============================================================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// Add production frontend URL from environment
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log('✅ Added FRONTEND_URL:', process.env.FRONTEND_URL);
}

// Add Vercel deployment URL
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  console.log('✅ Added VERCEL_URL');
}

// Allow configuring extra origins via env
const extraOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN;
if (extraOrigins) {
  extraOrigins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(o => {
      allowedOrigins.push(o);
      console.log('✅ Added extra origin:', o);
    });
}

// Regex patterns for allowed origins
const vercelDomainRegex = /^https:\/\/.*\.vercel\.app$/;
const allowedOriginRegex = /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin: function(origin, cb){
    // Allow requests with no origin (mobile apps, Postman, curl, etc)
    if (!origin) {
      return cb(null, true);
    }
    
    // Allow all Vercel preview/production domains
    if (vercelDomainRegex.test(origin)) {
      console.log('✅ CORS allowed (Vercel):', origin);
      return cb(null, true);
    }
    
    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed (configured):', origin);
      return cb(null, true);
    }
    
    // Allow localhost with any port
    if (allowedOriginRegex.test(origin)) {
      console.log('✅ CORS allowed (localhost):', origin);
      return cb(null, true);
    }
    
    // Log rejected origins for debugging
    console.log('⚠️ CORS blocked:', origin);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));

// Handle preflight requests explicitly
app.use(function(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).send();
  }
  next();
});

app.use(cookieParser());

// =============================================================================
// IMAGE UPLOAD MODULE - ENVIRONMENT AWARE
// =============================================================================

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

if (!isProduction && !isVercel) {
  // Local development only - use file system
  const uploadDir = path.join(__dirname, 'public/uploads');
  
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Upload directory created:', uploadDir);
    }
    
    app.use('/uploads', express.static(uploadDir));
    app.use(express.static('public'));
    
    console.log('📁 Local file storage enabled');
  } catch (error) {
    console.warn('⚠️ Could not create upload directory:', error.message);
  }
} else {
  // Production/Vercel - local uploads disabled
  console.log('☁️ Production mode - local file uploads disabled');
  console.log('💡 Use Cloudinary for file uploads in production');
}

// =============================================================================

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000,          // 45 seconds
})
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Default API route
app.get("/", (req, res) => {
  res.json({ 
    message: "Devugo Tech API is running 🚀",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check: report MongoDB connection state and quick totals for debugging
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
app.get('/api/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const info = {
    status: state === 1 ? 'healthy' : 'unhealthy',
    environment: process.env.NODE_ENV || 'development',
    dbState: state,
    dbStateText: states[state] || 'unknown',
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    timestamp: new Date().toISOString()
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
  }catch(_e){ 
    info.totalsError = 'Could not fetch collection counts';
  }
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

// =============================================================================
// IMAGE UPLOAD ROUTES
// =============================================================================
const imageRoutes = require('./routes/imageRoutes');
app.use('/api/images', imageRoutes);
// =============================================================================

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

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

// Multer error handling for image uploads
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Multer specific errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large! Maximum 5MB allowed.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files selected!'
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

// 404 handler - catch all undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// =============================================================================
// SERVER START
// =============================================================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`✅ All routes mounted`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

// Export for Vercel serverless
module.exports = app;