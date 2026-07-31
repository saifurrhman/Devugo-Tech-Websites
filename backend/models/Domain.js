const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  domainName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  spfVerified: { 
    type: Boolean, 
    default: false 
  },
  dkimVerified: { 
    type: Boolean, 
    default: false 
  },
  dmarcVerified: { 
    type: Boolean, 
    default: false 
  },
  dkimSelector: { 
    type: String 
  },
  dkimPublicKey: { 
    type: String 
  },
  dkimPrivateKey: { 
    type: String // Encrypted
  },
  verifiedAt: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('Domain', domainSchema);
