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
// ✅ CORS CONFIGURATION - FIXED FOR VERCEL
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://devugo-tech-websites.vercel.app', // ✅ Your frontend URL
];

// ✅ Add all Vercel preview URLs automatically
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

// ✅ Allow all Vercel preview deployments
const allowedOriginRegex = /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$|^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: function(origin, cb){
    // ✅ Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true);
    
    // ✅ Check against allowed origins or regex
    if (allowedOrigins.includes(origin) || allowedOriginRegex.test(origin)) {
      console.log('✅ CORS allowed for:', origin);
      return cb(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  exposedHeaders: ['Set-Cookie'], // ✅ Important for cookies
}));

// ✅ Enhanced preflight handling
app.use(function(req, res, next) {
  const origin = req.headers.origin;
  
  if (origin && (allowedOrigins.includes(origin) || allowedOriginRegex.test(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).send();
  }
  next();
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
} else {
  console.log('📁 Upload directory exists:', uploadDir);
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

app.get("/", (req, res) => {
  res.json({
    message: "API is running 🚀",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const info = {
    dbState: state,
    dbStateText: states[state] || 'unknown',
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    environment: process.env.NODE_ENV || 'development',
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
  } catch(_e) { /* ignore */ }

  res.json(info);
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
  console.error('Error:', err);

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
        message: 'Too many files!'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in form data!'
      });
    }
  }

  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins:`, allowedOrigins);
  console.log(`\n`);
});