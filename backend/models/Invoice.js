const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  // Invoice Number
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailRecipient',
    required: true
  },
  clientDetails: {
    name: String,
    email: String,
    phone: String,
    company: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },

  // Project Reference
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },

  // Invoice Details
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  
  // Line Items
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    }
  }],

  // Financial
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    required: true
  },

  // Payment Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Payment Details
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'bank_transfer', 'paypal', 'stripe', 'other']
    },
    transactionId: String,
    notes: String,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },

  // Notes
  notes: String,
  termsAndConditions: String,
  internalNotes: String,

  // PDF
  pdfUrl: String,
  pdfGeneratedAt: Date,

  // Tracking
  sentAt: Date,
  viewedAt: Date,
  paidAt: Date,
  
  sentTo: [String], // Email addresses
  
  remindersSent: [{
    sentAt: Date,
    type: {
      type: String,
      enum: ['first_reminder', 'second_reminder', 'final_reminder', 'overdue']
    }
  }],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Indexes
invoiceSchema.index({ client: 1, status: 1 });
invoiceSchema.index({ project: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

// Pre-save hook to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate tax
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  
  // Calculate discount
  let discountAmount = this.discount;
  if (this.discountType === 'percentage') {
    discountAmount = (this.subtotal * this.discount) / 100;
  }
  
  // Calculate total
  this.total = this.subtotal + this.taxAmount - discountAmount;
  
  // Calculate balance
  this.balance = this.total - this.amountPaid;
  
  // Update status based on payment
  if (this.amountPaid >= this.total) {
    this.status = 'paid';
    if (!this.paidAt) this.paidAt = new Date();
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  } else if (this.status !== 'draft' && this.dueDate < new Date() && this.status !== 'cancelled') {
    this.status = 'overdue';
  }
  
  next();
});

// Method to add payment
invoiceSchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  this.amountPaid += paymentData.amount;
  return this.save();
};

// Generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function() {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({ 
    invoiceNumber: new RegExp(`^INV-${year}`) 
  });
  
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

module.exports = mongoose.model('Invoice', invoiceSchema);