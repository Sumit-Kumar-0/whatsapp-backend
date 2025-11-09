import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  // Template Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'],
    default: 'UTILITY'
  },
  language: {
    type: String,
    required: true,
    default: 'en'
  },
  
  // Template Components
  header: {
    type: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'NONE'],
      default: 'NONE'
    },
    text: String,
    mediaId: String,
    mediaLink: String,
    example: {
      header_handle: [String]
    }
  },
  
  body: {
    text: {
      type: String,
      required: true
    },
    example: {
      body_text: [{
        type: String
      }]
    }
  },
  
  footer: {
    text: String
  },
  
  buttons: [{
    type: {
      type: String,
      enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER'],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    url: String,
    phoneNumber: String,
    example: [String]
  }],
  
  // Status & Meta
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'LIMITED'],
    default: 'DRAFT'
  },
  qualityRating: {
    type: String,
    enum: ['RED', 'YELLOW', 'GREEN', 'NA'],
    default: 'NA'
  },
  rejectedReason: String,
  
  // WhatsApp Specific
  templateId: String, // WhatsApp template ID
  namespace: String,
  
  // User and Business Info
  userId: {
    type: String,
    required: true
  },
  wabaId: {
    type: String,
    required: true
  },
  businessId: {
    type: String,
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  approvedAt: Date
}, {
  timestamps: true
});

// Indexes
templateSchema.index({ userId: 1 });
templateSchema.index({ wabaId: 1, name: 1 }, { unique: true });
templateSchema.index({ status: 1 });
templateSchema.index({ category: 1 });
templateSchema.index({ templateId: 1 });

// Pre-save middleware to update updatedAt
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Template', templateSchema);