import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'failed'],
    default: 'queued'
  },
  sentAt: {
    type: Date
  },
  deliveryStatus: {
    type: String
  },
  cost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Message', messageSchema);