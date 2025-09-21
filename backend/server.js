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
app.use(cors({
  origin: function(origin, cb){
    if (!origin) return cb(null, true); // SSR or curl
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Handle preflight requests (fixed version)
app.options(/.*/, cors());

app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

// Default API route
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const blogRoutes = require('./routes/blog');
app.use('/api/blog', blogRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
