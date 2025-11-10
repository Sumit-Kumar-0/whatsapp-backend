import express from 'express';
import axios from 'axios';
import Business from '../models/Business.js';

const router = express.Router();

// Single endpoint for all Facebook operations
router.post('/', async (req, res) => {
  try {
    const { action, code, wabaData, userId } = req.body;

    console.log('Received request:', { action, userId });

    // Token exchange action
    if (action === 'exchange_token' && code) {
      return await handleTokenExchange(req, res);
    }

    // Signup callback action  
    if (action === 'signup_callback' && wabaData) {
      return await handleSignupCallback(req, res);
    }

    // ✅ ADD THIS - Get permissions action
    if (action === 'get_permissions' && userId) {
      return await handleGetPermissions(req, res);
    }

    res.status(400).json({
      success: false,
      error: 'Invalid action or missing parameters'
    });

  } catch (error) {
    console.error('Facebook API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Token exchange handler
const handleTokenExchange = async (req, res) => {
  const { code, userId } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Token code is required'
    });
  }

  try {
    console.log('Exchanging token code:', code.substring(0, 10) + '...');

    // Token exchange API call to Facebook
    const response = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        code: `${code}`
      }
    });

    const { access_token, expires_in } = response.data;

    console.log(response.data, "response access token >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    await Business.findOneAndUpdate(
      { userId },
      {
        $set: {
          accessToken: access_token,
          accessTokenExpiresAt: expires_in,
          userId: userId,
          lastUpdated: new Date()
        },
        $setOnInsert: {
          connectedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      access_token: access_token ? 'Received' : 'Not received',
      expires_in,
      action: 'token_exchange'
    });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);

    let errorMessage = 'Token exchange failed';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message || errorMessage;
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Signup callback handler
const handleSignupCallback = async (req, res) => {
  const { wabaData, userId } = req.body;

  const savedData = {
    wabaId: wabaData.waba_id,
    phoneNumberId: wabaData.phone_number_id,
    businessId: wabaData.business_id,
    userId: userId,
    status: 'active',
    signupCompleted: true
  };

  await Business.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...savedData,
        lastUpdated: new Date()
      },
      $setOnInsert: {
        connectedAt: new Date()
      }
    },
    {
      new: true,
      upsert: true
    }
  );

  console.log('WABA Data saved successfully');

  res.json({
    success: true,
    message: 'WhatsApp Business Account connected successfully',
    data: savedData,
    action: 'signup_callback',
    next_step: 'check_permissions'
  });
};

// ✅ Get permissions handler - FIXED
const handleGetPermissions = async (req, res) => {
  const { userId } = req.body;

  try {
    console.log('Checking permissions for user:', userId);

    // User ka business record find karo
    const business = await Business.findOne({ userId });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business account not found. Please complete WhatsApp setup first.'
      });
    }

    if (!business.accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Access token not available. Please reconnect your account.'
      });
    }

    // Current token debug karo
    const debugResponse = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: {
        input_token: business.accessToken,
        access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
      }
    });

    const tokenData = debugResponse.data.data;
    const currentPermissions = tokenData.scopes || [];

    console.log('Current Permissions token data:', tokenData);

    // Check which permissions are missing
    const requiredPermissions = [
      'business_management',
      'whatsapp_business_management',
      'whatsapp_business_messaging'
    ];

    const missingPermissions = requiredPermissions.filter(
      perm => !currentPermissions.includes(perm)
    );

    // ✅ Update permissions in database
    await Business.findOneAndUpdate(
      { userId },
      {
        $set: {
          tokenPermissions: currentPermissions,
          permissionsGranted: missingPermissions.length === 0,
          lastUpdated: new Date()
        }
      }
    );

    res.json({
      success: true,
      current_permissions: currentPermissions,
      missing_permissions: missingPermissions,
      has_all_permissions: missingPermissions.length === 0,
      required_permissions: requiredPermissions,
      action: 'get_permissions'
    });

  } catch (error) {
    console.error('Get permissions error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to check permissions';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message || errorMessage;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// ✅ New endpoint for requesting additional permissions
router.post('/request-permissions', async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('Generating permission URL for user:', userId);

    const business = await Business.findOne({ userId });
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business account not found'
      });
    }

    const permissionUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FRONTEND_URL}/dashboard&scope=business_management,whatsapp_business_management,whatsapp_business_messaging&state=${userId}&response_type=code`;

    console.log('Generated permission URL');

    res.json({
      success: true,
      permission_url: permissionUrl,
      message: 'Use this URL to request additional permissions'
    });

  } catch (error) {
    console.error('Request permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate permission URL'
    });
  }
});

export default router;