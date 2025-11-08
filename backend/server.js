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
// TRUST PROXY (VERCEL KE LIYE ZAROORI)
// ============================================
app.set('trust proxy', 1);

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
// CORS CONFIGURATION (IMPROVED FOR VERCEL)
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://devugo-tech-websites.vercel.app',
  process.env.FRONTEND_URL, // Frontend URL from env
].filter(Boolean);

// Extra origins from environment variables
const extraOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN;
if (extraOrigins) {
  extraOrigins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(o => {
      if (!allowedOrigins.includes(o)) {
        allowedOrigins.push(o);
      }
    });
}

// Vercel domains ko automatically allow karein
const allowedOriginRegex = /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$|^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: function(origin, cb){
    // No origin (Postman, mobile apps, etc.)
    if (!origin) return cb(null, true);
    
    // Check allowed origins or regex
    if (allowedOrigins.includes(origin) || allowedOriginRegex.test(origin)) {
      console.log('✅ CORS allowed for:', origin);
      return cb(null, true);
    }
    
    console.warn('❌ CORS blocked origin:', origin);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Preflight requests
app.use(function(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).send();
  }
  next();
});

app.use(cookieParser());

// ============================================
// STATIC FILES (ONLY FOR LOCAL, NOT VERCEL)
// ============================================
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
  app.use(express.static('public'));
  
  const uploadDir = path.join(__dirname, 'public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Upload directory created:', uploadDir);
  }
}

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ============================================
// ROUTES
// ============================================

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "✅ Devugo Tech API is running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      blog: '/api/blog',
      services: '/api/services',
      portfolio: '/api/portfolio',
      team: '/api/team',
      contact: '/api/contact'
    }
  });
});

// Health check with better error handling
app.get('/api/health', async (_req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    const info = {
      status: 'ok',
      dbState: state,
      dbStateText: states[state] || 'unknown',
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    // Try to get counts (with error handling)
    try {
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
    } catch(e) {
      info.totals = { error: 'Could not fetch counts' };
    }

    res.json(info);
  } catch(error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// API Routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch(e) { console.error('❌ Auth routes error:', e.message); }

try {
  const blogRoutes = require('./routes/blog');
  app.use('/api/blog', blogRoutes);
} catch(e) { console.error('❌ Blog routes error:', e.message); }

try {
  const contactRoutes = require('./routes/contact');
  app.use('/api/contact', contactRoutes);
} catch(e) { console.error('❌ Contact routes error:', e.message); }

try {
  const analyticsRoutes = require('./routes/analytics');
  app.use('/api/analytics', analyticsRoutes);
} catch(e) { console.error('❌ Analytics routes error:', e.message); }

try {
  const uploadRoutes = require('./routes/upload');
  app.use('/api/upload', uploadRoutes);
} catch(e) { console.error('❌ Upload routes error:', e.message); }

try {
  const imageRoutes = require('./routes/imageRoutes');
  app.use('/api/images', imageRoutes);
} catch(e) { console.error('❌ Image routes error:', e.message); }

try {
  const serviceRoutes = require('./routes/services');
  app.use('/api/services', serviceRoutes);
} catch(e) { console.error('❌ Service routes error:', e.message); }

try {
  const pricingRoutes = require('./routes/pricing');
  app.use('/api/pricing', pricingRoutes);
} catch(e) { console.error('❌ Pricing routes error:', e.message); }

try {
  const portfolioRoutes = require('./routes/portfolio');
  app.use('/api/portfolio', portfolioRoutes);
} catch(e) { console.error('❌ Portfolio routes error:', e.message); }

try {
  const teamRoutes = require('./routes/team');
  app.use('/api/team', teamRoutes);
} catch(e) { console.error('❌ Team routes error:', e.message); }

try {
  const portfolioCategoryRoutes = require('./routes/portfolioCategories');
  app.use('/api/portfolio-categories', portfolioCategoryRoutes);
} catch(e) { console.error('❌ Portfolio category routes error:', e.message); }

try {
  const techStackRoutes = require('./routes/techStack');
  app.use('/api/tech-stack', techStackRoutes);
} catch(e) { console.error('❌ Tech stack routes error:', e.message); }

try {
  const reviewRoutes = require('./routes/reviews');
  app.use('/api/reviews', reviewRoutes);
} catch(e) { console.error('❌ Review routes error:', e.message); }

try {
  const faqRoutes = require('./routes/faqs');
  app.use('/api/faqs', faqRoutes);
} catch(e) { console.error('❌ FAQ routes error:', e.message); }

try {
  const formRoutes = require('./routes/forms');
  app.use('/api/forms', formRoutes);
} catch(e) { console.error('❌ Form routes error:', e.message); }

try {
  const blogCategoryRoutes = require('./routes/blogCategories');
  app.use('/api/blog-categories', blogCategoryRoutes);
} catch(e) { console.error('❌ Blog category routes error:', e.message); }

try {
  const socialLinkRoutes = require('./routes/socialLinks');
  app.use('/api/social-links', socialLinkRoutes);
} catch(e) { console.error('❌ Social link routes error:', e.message); }

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: ['/api/health', '/api/auth', '/api/blog', '/api/services']
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Multer errors
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

  // File type error
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      origin: req.headers.origin
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================
// START SERVER (VERCEL EXPORTS THIS)
// ============================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Allowed origins:`, allowedOrigins);
    console.log(`\n`);
  });
}

// Export for Vercel
module.exports = app;