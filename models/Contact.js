import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  category: {
    type: String,
    enum: ['customer', 'lead', 'supplier', 'other'],
    default: 'customer'
  },
  tags: [{
    type: String
  }],
  source: {
    type: String
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

export default mongoose.model('Contact', contactSchema);