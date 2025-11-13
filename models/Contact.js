import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  countryCode: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  company: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['customer', 'lead', 'supplier', 'other'],
    default: 'customer'
  },
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastContacted: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for unique phone number per vendor
contactSchema.index({ vendorId: 1, countryCode: 1, phoneNumber: 1 }, { unique: true });

export default mongoose.model('Contact', contactSchema);