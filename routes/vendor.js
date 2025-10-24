import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all vendor routes
router.use(protect);
router.use(authorize('vendor', 'admin'));

// Vendor dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        totalContacts: 0,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

export default router;