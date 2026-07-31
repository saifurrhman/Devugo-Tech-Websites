const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const Sender = require('../models/Sender');
const { encrypt, decrypt } = require('../utils/encryption');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Generate OAuth URL for Google Consent Screen
 */
exports.getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    prompt: 'consent', // Force to always get a refresh token
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  });
};

/**
 * Handle OAuth Callback and save sender
 */
exports.handleCallback = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Get user info (email address)
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });
  const userInfo = await oauth2.userinfo.get();
  
  const email = userInfo.data.email;
  const name = userInfo.data.name || email.split('@')[0];

  // Encrypt refresh token
  const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;

  // Check if sender already exists
  let sender = await Sender.findOne({ emailAddress: email });
  
  if (sender) {
    // Update existing
    sender.type = 'gmail_oauth';
    sender.displayName = name;
    if (encryptedRefreshToken) {
      sender.oauthRefreshToken = encryptedRefreshToken;
    }
    sender.oauthAccessToken = tokens.access_token;
    sender.oauthTokenExpiry = new Date(tokens.expiry_date);
    sender.isVerified = true;
    await sender.save();
  } else {
    // Create new
    sender = await Sender.create({
      type: 'gmail_oauth',
      emailAddress: email,
      displayName: name,
      isVerified: true,
      oauthRefreshToken: encryptedRefreshToken,
      oauthAccessToken: tokens.access_token,
      oauthTokenExpiry: new Date(tokens.expiry_date)
    });
  }

  return sender;
};

/**
 * Send Email via Gmail API
 */
exports.sendViaGmail = async (senderId, to, subject, htmlBody) => {
  try {
    const sender = await Sender.findById(senderId);
    if (!sender || sender.type !== 'gmail_oauth') {
      throw new Error('Invalid sender or sender is not configured for Gmail OAuth');
    }

    if (!sender.oauthRefreshToken) {
      throw new Error('No refresh token available for this sender');
    }

    // Set up OAuth client with the saved refresh token
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    client.setCredentials({
      refresh_token: decrypt(sender.oauthRefreshToken)
    });

    const gmail = google.gmail({ version: 'v1', auth: client });

    // Use Nodemailer to construct the raw RFC 2822 email
    const mailOptions = {
      from: `"${sender.displayName}" <${sender.emailAddress}>`,
      to: to,
      subject: subject,
      html: htmlBody,
      text: htmlBody.replace(/<[^>]*>?/gm, '') // Simple fallback text
    };

    const MailComposer = require('nodemailer/lib/mail-composer');
    const mail = new MailComposer(mailOptions);
    const messageBuffer = await mail.compile().build();
    
    // Base64url encode the message
    const encodedMessage = messageBuffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send using Gmail API
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return { success: true, messageId: res.data.id, response: res.data };
  } catch (error) {
    console.error('Failed to send via Gmail API:', error);
    throw error;
  }
};
