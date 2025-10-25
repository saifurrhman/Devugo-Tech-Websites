const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

console.log('🔐 Configuring Passport strategies...');

// Configure Passport strategies
module.exports = function() {
  
  // ============================================image.png
  // GOOGLE OAUTH STRATEGY
  // ============================================
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth: User authenticated', profile.id);
        
        // Check if user already exists with Google ID
        let user = await User.findOne({ 'google.id': profile.id });
        
        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }
        
        // Check if user exists with the same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email provided by Google'), null);
        }
        
        user = await User.findOne({ email });
        
        if (user) {
          // Link Google account to existing user
          user.google = {
            id: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
          };
          user.lastLogin = new Date();
          
          // Update avatar if not set
          if (!user.avatar && profile.photos && profile.photos[0]) {
            user.avatar = profile.photos[0].value;
          }
          
          await user.save();
          return done(null, user);
        }
        
        // Create new user
        const newUser = await User.create({
          name: profile.displayName,
          email: email,
          role: 'user',
          google: {
            id: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
          },
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          lastLogin: new Date(),
          isActive: true
        });
        
        console.log('New user created via Google OAuth:', newUser.email);
        return done(null, newUser);
        
      } catch (err) {
        console.error('Google OAuth error:', err);
        return done(err, null);
      }
    }));
    
    console.log('✅ Google OAuth strategy configured');
  } else {
    console.log('⚠️  Google OAuth not configured (missing credentials)');
  }
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
      state: true
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('LinkedIn OAuth: User authenticated', profile.id);
        
        // Check if user already exists with LinkedIn ID
        let user = await User.findOne({ 'linkedin.id': profile.id });
        
        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }
        
        // Check if user exists with the same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email provided by LinkedIn'), null);
        }
        
        user = await User.findOne({ email });
        
        if (user) {
          // Link LinkedIn account to existing user
          user.linkedin = {
            id: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
          };
          user.lastLogin = new Date();
          
          // Update avatar if not set
          if (!user.avatar && profile.photos && profile.photos[0]) {
            user.avatar = profile.photos[0].value;
          }
          
          await user.save();
          return done(null, user);
        }
        
        // Create new user
        const newUser = await User.create({
          name: profile.displayName,
          email: email,
          role: 'user',
          linkedin: {
            id: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
          },
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          lastLogin: new Date(),
          isActive: true
        });
        
        console.log('New user created via LinkedIn OAuth:', newUser.email);
        return done(null, newUser);
        
      } catch (err) {
        console.error('LinkedIn OAuth error:', err);
        return done(err, null);
      }
    }));
    
    console.log('✅ LinkedIn OAuth strategy configured');
  } else {
    console.log('⚠️  LinkedIn OAuth not configured (missing credentials)');
  }
  
  console.log('✅ Passport configuration complete');
};