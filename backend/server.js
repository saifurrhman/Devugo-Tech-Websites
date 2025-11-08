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

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ============================================
// SESSION CONFIGURATION
// ============================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'devugo-tech-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ============================================
// PASSPORT CONFIGURATION
// ============================================
app.use(passport.initialize());
app.use(passport.session());

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

// ============================================
// ✅ CRITICAL FIX: CORS MUST BE BEFORE ROUTES
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://devugo-tech-websites.vercel.app', // ✅ Your production frontend
];

// Add environment variable origins
if (process.env.CORS_ORIGINS) {
  const extraOrigins = process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
  extraOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

console.log('✅ Allowed CORS Origins:', allowedOrigins);

// Allow all Vercel preview URLs
const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

// ✅ CORS Configuration - MUST be BEFORE routes
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
      console.log('✅ CORS: Allowed origin:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS: Blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight for 24 hours
}));

// ✅ Additional CORS headers for preflight
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || vercelRegex.test(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  }
  res.sendStatus(200);
});

app.use(cookieParser());

// ============================================
// IMAGE UPLOAD FOLDER
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static('public'));

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created:', uploadDir);
}

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ============================================
// ROUTES
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "API is running 🚀",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    status: 'ok',
    database: state === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

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

const imageRoutes = require('./routes/imageRoutes');
app.use('/api/images', imageRoutes);

const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);

const pricingRoutes = require('./routes/pricing');
app.use('/api/pricing', pricingRoutes);

const portfolioRoutes = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRoutes);

const teamRoutes = require('./routes/team');
app.use('/api/team', teamRoutes);

const portfolioCategoryRoutes = require('./routes/portfolioCategories');
app.use('/api/portfolio-categories', portfolioCategoryRoutes);

const techStackRoutes = require('./routes/techStack');
app.use('/api/tech-stack', techStackRoutes);

const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

const faqRoutes = require('./routes/faqs');
app.use('/api/faqs', faqRoutes);

const formRoutes = require('./routes/forms');
app.use('/api/forms', formRoutes);

const blogCategoryRoutes = require('./routes/blogCategories');
app.use('/api/blog-categories', blogCategoryRoutes);

const socialLinkRoutes = require('./routes/socialLinks');
app.use('/api/social-links', socialLinkRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error'
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed'
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server on port ${PORT}`);
  console.log(`📍 ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origins:`, allowedOrigins);
})
