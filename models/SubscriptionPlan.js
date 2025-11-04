import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Free', 'Basic', 'Premium']
  },
  description: {
    type: String,
    required: true
  },
  contactsLimit: {
    type: Number,
    required: true
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  yearlyPrice: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  position: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);