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

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

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

// PASSPORT CONFIGURATION
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

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://devugo-tech-websites.vercel.app',
];

if (process.env.CORS_ORIGINS) {
  const extraOrigins = process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
  extraOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

console.log('✅ Allowed CORS Origins:', allowedOrigins);

const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(cookieParser());

// ========================================
// STATIC FILES
// ========================================

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static('public'));

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created');
} else {
  console.log('📁 Upload directory exists:', uploadDir);
}

// ========================================
// MONGODB CONNECTION
// ========================================

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ========================================
// HEALTH CHECK ROUTES
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "API is running 🚀",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========================================
// EXISTING ROUTES
// ========================================

console.log('📋 Loading existing routes...');

// Auth Routes
// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Admin Routes (User Management)
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

console.log('✅ Auth & Admin routes loaded');

// Blog Routes
const blogRoutes = require('./routes/blog');
app.use('/api/blog', blogRoutes);

// Contact Routes
const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);
app.use('/api/contact-lists', require('./routes/listRoutes'));

// Analytics Routes
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

// Upload Routes
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

// Image Routes 
const imageRoutes = require('./routes/imageRoutes');
app.use('/api/images', imageRoutes);

// Service Routes
const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);

// Pricing Routes
const pricingRoutes = require('./routes/pricing');
app.use('/api/pricing', pricingRoutes);

// Portfolio Routes
const portfolioRoutes = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRoutes);

// Team Routes
const teamRoutes = require('./routes/team');
app.use('/api/team', teamRoutes);

// Portfolio Category Routes
const portfolioCategoryRoutes = require('./routes/portfolioCategories');
app.use('/api/portfolio-categories', portfolioCategoryRoutes);

// Tech Stack Routes
const techStackRoutes = require('./routes/techStack');
app.use('/api/tech-stack', techStackRoutes);

// Review Routes
const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

// FAQ Routes
const faqRoutes = require('./routes/faqs');
app.use('/api/faqs', faqRoutes);

// Form Routes
const formRoutes = require('./routes/forms');
app.use('/api/forms', formRoutes);

// Blog Category Routes
const blogCategoryRoutes = require('./routes/blogCategories');
app.use('/api/blog-categories', blogCategoryRoutes);

// Social Link Routes
const socialLinkRoutes = require('./routes/socialLinks');
app.use('/api/social-links', socialLinkRoutes);

// Company Info Routes
const companyInfoRoutes = require('./routes/companyInfo');
app.use('/api/company-info', companyInfoRoutes);

console.log('✅ All existing routes loaded');

// ========================================
// EMAIL SYSTEM ROUTES (DEBUG VERSION)
// ========================================

console.log('📧 Loading email system routes...');

try {
  console.log('  Loading recipients...');
  const recipientRoutes = require('./routes/recipients');
  app.use('/api/recipients', recipientRoutes);
  console.log('  ✅ Recipients loaded');
} catch (error) {
  console.error('  ❌ Recipients error:', error.message);
}

try {
  console.log('  Loading emailLists...');
  const listRoutes = require('./routes/emailLists');
  app.use('/api/lists', listRoutes);
  console.log('  ✅ Email lists loaded');
} catch (error) {
  console.error('  ❌ Email lists error:', error.message);
}

try {
  console.log('  Loading campaigns...');
  const campaignRoutes = require('./routes/campaigns');
  app.use('/api/campaigns', campaignRoutes);
  console.log('  ✅ Campaigns loaded');
} catch (error) {
  console.error('  ❌ Campaigns error:', error.message);
}

try {
  console.log('  Loading templates...');
  const templateRoutes = require('./routes/templates');
  app.use('/api/templates', templateRoutes);
  console.log('  ✅ Templates loaded');
} catch (error) {
  console.error('  ❌ Templates error:', error.message);
}

try {
  console.log('  Loading schedules...');
  const scheduleRoutes = require('./routes/emailSchedules');
  app.use('/api/schedules', scheduleRoutes);
  console.log('  ✅ Schedules loaded');
} catch (error) {
  console.error('  ❌ Schedules error:', error.message);
}

try {
  console.log('  Loading email-logs...');
  const emailLogRoutes = require('./routes/emailLogs');
  app.use('/api/email-logs', emailLogRoutes);
  console.log('  ✅ Email logs loaded');
} catch (error) {
  console.error('  ❌ Email logs error:', error.message);
}

try {
  console.log('  Loading messages...');
  const messageRoutes = require('./routes/messages');
  app.use('/api/messages', messageRoutes);
  console.log('  ✅ Messages loaded');
} catch (error) {
  console.error('  ❌ Messages error:', error.message);
}

console.log('📧 Email system routes loading complete\n');

try {
  console.log('  Loading senders...');
  const senderRoutes = require('./routes/senderRoutes');
  app.use('/api/senders', senderRoutes);
  console.log('  ✅ Senders loaded');
} catch (error) {
  console.error('  ❌ Senders error:', error.message);
}

// ========================================
// SETTINGS & AI ROUTES
// ========================================

try {
  console.log('⚡ Loading settings routes...');
  const settingsRoutes = require('./routes/settingsRoutes');
  app.use('/api/settings', settingsRoutes);
  console.log('  ✅ Settings routes loaded');
} catch (error) {
  console.error('  ❌ Settings routes error:', error.message);
}

try {
  console.log('🤖 Loading AI routes...');
  const aiRoutes = require('./routes/aiRoutes');
  app.use('/api/ai', aiRoutes);
  console.log('  ✅ AI routes loaded');
} catch (error) {
  console.error('  ❌ AI routes error:', error.message);
}

// ========================================
// CRM FEATURES ROUTES (DEBUG VERSION)
// ========================================

console.log('🎯 Loading CRM routes...');

try {
  console.log('  Loading invoices...');
  const invoiceRoutes = require('./routes/invoices');
  app.use('/api/invoices', invoiceRoutes);
  console.log('  ✅ Invoice routes loaded');
} catch (error) {
  console.error('  ❌ Invoice routes error:', error.message);
}

try {
  console.log('  Loading meetings...');
  const meetingRoutes = require('./routes/meetings');
  app.use('/api/meetings', meetingRoutes);
  console.log('  ✅ Meeting routes loaded');
} catch (error) {
  console.error('  ❌ Meeting routes error:', error.message);
}

try {
  console.log('  Loading pipeline...');
  const pipelineRoutes = require('./routes/pipeline');
  app.use('/api/pipeline', pipelineRoutes);
  console.log('  ✅ Pipeline routes loaded');
} catch (error) {
  console.error('  ❌ Pipeline routes error:', error.message);
}

try {
  console.log('  Loading projects...');
  const projectRoutes = require('./routes/projects');
  app.use('/api/projects', projectRoutes);
  console.log('  ✅ Project routes loaded');
} catch (error) {
  console.error('  ❌ Project routes error:', error.message);
}

try {
  console.log('  Loading tracking...');
  const trackingRoutes = require('./routes/tracking');
  app.use('/api/tracking', trackingRoutes);
  console.log('  ✅ Tracking routes loaded');
} catch (error) {
  console.error('  ❌ Tracking routes error:', error.message);
}

try {
  console.log('  Loading webhooks...');
  const webhookRoutes = require('./routes/webhooks');
  app.use('/api/webhooks', webhookRoutes);
  console.log('  ✅ Webhook routes loaded');
} catch (error) {
  console.error('  ❌ Webhook routes error:', error.message);
}

try {
  console.log('  Loading inbox...');
  const inboxRoutes = require('./routes/inbox');
  app.use('/api/inbox', inboxRoutes);
  console.log('  ✅ Inbox routes loaded');
} catch (error) {
  console.error('  ❌ Inbox routes error:', error.message);
}

console.log('🎯 CRM routes loading complete\n');

// ========================================
// BACKGROUND JOBS
// ========================================

if (process.env.ENABLE_JOBS !== 'false' && process.env.NODE_ENV !== 'test') {
  console.log('⚙️  Starting background jobs...');

  try {
    // Start AI Personalizer Job
    require('./jobs/aiPersonalizer');
    console.log('✅ AI Personalizer job started');

    // Start Email Tracker Job
    require('./jobs/emailTracker');
    console.log('✅ Email Tracker job started');

    // Start Follow-up Automation Job
    require('./jobs/followUpAutomation');
    console.log('✅ Follow-up Automation job started');

    console.log('🎉 All background jobs started successfully!');
  } catch (error) {
    console.warn('⚠️  Background jobs not available:', error.message);
  }
} else {
  console.log('⏸️  Background jobs are disabled');
}

// ========================================
// ERROR HANDLING
// ========================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed'
    });
  }

  // File type errors
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose cast errors (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('🔄 Forced Restart Triggered');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}`);
  console.log(`📍 CORS Origins: ${allowedOrigins.length} origins allowed`);
  console.log(`📍 Time: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60) + '\n');
});

// Export for Vercel
module.exports = app;

// ========================================
// GRACEFUL SHUTDOWN (FIXED - PROMISE BASED)
// ========================================

process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close()
      .then(() => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      })
      .catch((err) => {
        console.error('❌ Error closing MongoDB:', err);
        process.exit(1);
      });
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close()
      .then(() => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      })
      .catch((err) => {
        console.error('❌ Error closing MongoDB:', err);
        process.exit(1);
      });
  });
});

// ========================================
// UNHANDLED PROMISE REJECTIONS
// ========================================

process.on('unhandledRejection', (err) => {
  console.error('\n❌ UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  server.close(() => {
    process.exit(1);
  });
});

// ========================================
// UNCAUGHT EXCEPTIONS
// ========================================

process.on('uncaughtException', (err) => {
  console.error('\n❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  process.exit(1);
});

// Forced restart trigger 11 (Enable Brevo)