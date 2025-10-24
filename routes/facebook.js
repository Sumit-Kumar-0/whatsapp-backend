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
    const response = await axios.get(`https://graph.facebook.com/v24.0/oauth/access_token`, {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        code: `${code}`
      }
    });

    const { access_token, expires_in } = response.data;

    console.log(response.data, "Access token received>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    await Business.findOneAndUpdate(
      { userId }, // filter (userId ke base pe)
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

  console.log('Received WABA Data:', wabaData);
  console.log('For User ID:', userId);

  // Data save karo database mein (yahan tumhara database logic add karna)
  const savedData = {
    wabaId: wabaData.waba_id,
    phoneNumberId: wabaData.phone_number_id,
    businessId: wabaData.business_id,
    userId: userId,
    status: 'active'
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

  console.log('Data to be saved:', savedData);

  // TODO: Save to your database
  // Example:
  // await saveWABADataToDatabase(savedData);

  res.json({
    success: true,
    message: 'WhatsApp Business Account connected successfully',
    data: savedData,
    action: 'signup_callback'
  });
};

export default router;