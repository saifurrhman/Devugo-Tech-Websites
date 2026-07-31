const crypto = require('crypto');
require('dotenv').config();

// Ensure the secret key is 32 bytes (256 bits) long.
// If ENCRYPTION_KEY is not set or not 32 bytes, we create a fallback (not recommended for production, but prevents crashes during dev)
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.warn('⚠️ WARNING: ENCRYPTION_KEY is missing or invalid. Using a default temporary key for development. Set a 32-character ENCRYPTION_KEY in .env');
    // Using a static dev key for now so restarts don't invalidate DB items
    ENCRYPTION_KEY = 'DEV_TEMP_KEY_32_BYTES_DO_NOT_USE!';
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a plain text string using AES-256-GCM
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted string in format: iv:salt:tag:encryptedText (base64)
 */
function encrypt(text) {
    if (!text) return text;
    
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const salt = crypto.randomBytes(SALT_LENGTH);
        const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
        
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        // Return format: iv:salt:tag:encrypted (all hex) -> combined and base64 encoded
        const combined = `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
        return Buffer.from(combined).toString('base64');
    } catch (err) {
        console.error('Encryption failed:', err);
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypts an encrypted string
 * @param {string} encryptedData - The encrypted string (base64)
 * @returns {string} - The decrypted plain text
 */
function decrypt(encryptedData) {
    if (!encryptedData) return encryptedData;
    
    try {
        const combined = Buffer.from(encryptedData, 'base64').toString('utf8');
        const parts = combined.split(':');
        
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const salt = Buffer.from(parts[1], 'hex');
        const tag = Buffer.from(parts[2], 'hex');
        const encrypted = parts[3];
        
        const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (err) {
        console.error('Decryption failed:', err);
        return null;
    }
}

module.exports = {
    encrypt,
    decrypt
};
