import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Personal Details
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true
  },
  whatsappCountryCode: {
    type: String,
    required: true,
    trim: true
  },
  
  // Business Details
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessCountry: {
    type: String,
    required: true,
    trim: true
  },
  businessWebsite: {
    type: String,
    required: true,
    trim: true
  },
  
  // New Fields from Step 3
  useCase: {
    type: String,
    required: true
  },
  contactSize: {
    type: String,
    required: true
  },
  monthlyBudget: {
    type: String,
    required: true
  },
  businessCategory: {
    type: String,
    required: true
  },
  companySize: {
    type: String,
    required: true
  },
  roleInCompany: {
    type: String,
    required: true
  },
  
  // Referral Source
  referralSource: {
    type: String,
    required: true,
    trim: true
  },
  
  // Existing System Fields
    role: {
    type: String,
    enum: ['admin', 'vendor'],
    default: 'vendor'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationCode;
  return user;
};

export default mongoose.model('User', userSchema);