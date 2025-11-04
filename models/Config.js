import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String, // Sab encrypted hi honge
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['general', 'social', 'email', 'jwt', 'database'],
    default: 'general'
  }
}, {
  timestamps: true
});

export default mongoose.model('Config', configSchema);