import Config from "../models/Config.js";
import CryptoJS from 'crypto-js';

// Encryption key (any length)
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || 'your-secret-encryption-key-123';

// Encryption function
const encrypt = (text) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    throw new Error('Encryption failed: ' + error.message);
  }
};

// Decryption function
const decrypt = (encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or data');
    }
    
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
};

// Get all configs - SABHI DECRYPT KARKE RETURN KARO
export const getAllConfigs = async () => {
  const configs = await Config.find().sort({ category: 1, key: 1 });
  
  const processedConfigs = configs.map((config) => {
    const configObj = config.toObject();
    
    // Sabhi values ko decrypt karke return karo
    try {
      configObj.value = decrypt(config.value);
    } catch (error) {
      configObj.value = 'DECRYPTION_ERROR';
    }
    
    return configObj;
  });
  
  return processedConfigs;
};

// Get config by key - DECRYPT KARKE RETURN KARO
export const getConfigByKey = async (key) => {
  const config = await Config.findOne({ key });
  if (!config) return null;

  const configObj = config.toObject();
  
  try {
    configObj.value = decrypt(config.value);
  } catch (error) {
    configObj.value = 'DECRYPTION_ERROR';
  }
  
  return configObj;
};

// Create or update config - SABHI ENCRYPT KARKE SAVE KARO
export const upsertConfig = async (key, value, description = '', category = 'general') => {
  // Always encrypt the value before saving to database
  let processedValue;
  try {
    processedValue = encrypt(value.toString());
  } catch (error) {
    throw new Error('Failed to encrypt value: ' + error.message);
  }

  const config = await Config.findOneAndUpdate(
    { key },
    { 
      value: processedValue, // ✅ Database mein encrypted value save hoga
      description,
      category
    },
    { upsert: true, new: true, runValidators: true }
  );

  return config;
};

// Delete config
export const deleteConfig = async (id) => {
  const config = await Config.findByIdAndDelete(id); // Use findByIdAndDelete instead
  return config;
};

// Get public configs for frontend - SABHI DECRYPT KARKE RETURN KARO
export const getPublicConfigs = async () => {
  const configs = await Config.find();
  
  return configs.reduce((acc, config) => {
    try {
      const decryptedValue = decrypt(config.value);
      acc[config.key] = decryptedValue;
    } catch (error) {
      acc[config.key] = 'DECRYPTION_ERROR';
    }
    return acc;
  }, {});
};

// Initialize default configs - SABHI ENCRYPT KARKE SAVE KARO
// export const initializeDefaultConfigs = async () => {
//   const defaultConfigs = [
//     // Frontend Configs
//     { 
//       key: 'NEXT_PUBLIC_API_URL', 
//       value: 'https://nancey-bristly-spiritedly.ngrok-free.dev/api', 
//       description: 'Frontend API URL', 
//       category: 'general'
//     },
//     { 
//       key: 'NEXT_PUBLIC_FACEBOOK_APP_ID', 
//       value: '1865430164369745', 
//       description: 'Facebook App ID for frontend', 
//       category: 'social'
//     },
//     { 
//       key: 'NEXT_PUBLIC_FACEBOOK_CONFIG_ID', 
//       value: '3117517458421960', 
//       description: 'Facebook Config ID', 
//       category: 'social'
//     },

//     // Backend Configs
//     { 
//       key: 'NODE_ENV', 
//       value: 'development', 
//       description: 'Node environment', 
//       category: 'general'
//     },
//     { 
//       key: 'PORT', 
//       value: '5000', 
//       description: 'Server port', 
//       category: 'general'
//     },
//     { 
//       key: 'MONGODB_URI', 
//       value: 'mongodb+srv://schoudhary12380_db_user:Xi13CIuI4MVoOKyH@cluster0.sdo3ug5.mongodb.net/whatsappbulk', 
//       description: 'MongoDB connection string', 
//       category: 'database'
//     },
//     { 
//       key: 'JWT_SECRET', 
//       value: 'adf3b917d6c9f8bca7f23c1783fca9e6b8d7a8cf1e1cc7d40a7d5c84a5c9e5cf8fcb15b73e48bfa4c2c88e83e7e15bca3d2c1f70b0e5d2a2a2', 
//       description: 'JWT secret key', 
//       category: 'jwt'
//     },
//     { 
//       key: 'JWT_EXPIRES_IN', 
//       value: '7d', 
//       description: 'JWT expiration time', 
//       category: 'jwt'
//     },
//     { 
//       key: 'FRONTEND_URL', 
//       value: 'https://bangup-gulpingly-delana.ngrok-free.dev', 
//       description: 'Frontend URL', 
//       category: 'general'
//     },

//     // Facebook Configs
//     { 
//       key: 'FACEBOOK_APP_ID', 
//       value: '1865430164369745', 
//       description: 'Facebook App ID', 
//       category: 'social'
//     },
//     { 
//       key: 'FACEBOOK_APP_SECRET', 
//       value: '7eca498cb86c5df750e3cab7336e59dc', 
//       description: 'Facebook App Secret', 
//       category: 'social'
//     },

//     // SMTP Configs
//     { 
//       key: 'SMTP_HOST', 
//       value: 'smtp.gmail.com', 
//       description: 'SMTP host', 
//       category: 'email'
//     },
//     { 
//       key: 'SMTP_PORT', 
//       value: '587', 
//       description: 'SMTP port', 
//       category: 'email'
//     },
//     { 
//       key: 'SMTP_USER', 
//       value: 'schoudhary12380@gmail.com', 
//       description: 'SMTP username', 
//       category: 'email'
//     },
//     { 
//       key: 'SMTP_PASS', 
//       value: 'whsfryegtvojyxka', 
//       description: 'SMTP password', 
//       category: 'email'
//     },
//     { 
//       key: 'SMTP_FROM', 
//       value: 'wanotifier <noreply@bulkservice.com>', 
//       description: 'SMTP from address', 
//       category: 'email'
//     },
//   ];

//   for (const config of defaultConfigs) {
//     await upsertConfig(
//       config.key,
//       config.value,
//       config.description,
//       config.category
//     );
//   }

//   console.log('Default configurations initialized with CryptoJS encryption');
// };

export default {
  getAllConfigs,
  getConfigByKey,
  upsertConfig,
  deleteConfig,
  getPublicConfigs,
//   initializeDefaultConfigs
};