import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({

  tokenPermissions: [{
    type: String,
    default: []
  }],

  signupCompleted: {
    type: Boolean,
    default: false
  },

  permissionsGranted: {
    type: Boolean,
    default: false
  },
  
  // User reference
  userId: {
    type: String,
    required: true,
    index: true
  },

  // WhatsApp Business Account Details
  wabaId: {
    type: String,
    required: true
  },
  phoneNumberId: {
    type: String,
    required: true
  },
  businessId: {  // ← YEH CHANGE KARO: businessPortfolioId → businessId
    type: String,
    required: true
  },

  // Authentication
  accessToken: {
    type: String,
    required: true
  },
  accessTokenExpiresAt: {
    type: Date,
    required: true
  },

  // Additional Info
  businessName: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },

  // Timestamps
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Optional: Indexes for better performance
BusinessSchema.index({ userId: 1, wabaId: 1 });
BusinessSchema.index({ accessTokenExpiresAt: 1 });

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);