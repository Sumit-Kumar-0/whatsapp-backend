import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        totalVendors: 0,
        totalActiveVendors: 0,
        totalContacts: 0,
        totalCampaigns: 0,
        messagesInQueue: 0,
        messagesProcessed: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// Get all vendors
router.get('/vendors', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

export default router;