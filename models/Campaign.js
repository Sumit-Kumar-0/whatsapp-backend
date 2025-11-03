import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  message: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'premium', 'new'],
    default: 'all'
  },
  scheduledAt: {
    type: Date
  },
  sentCount: {
    type: Number,
    default: 0
  },
  totalContacts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Campaign', campaignSchema);