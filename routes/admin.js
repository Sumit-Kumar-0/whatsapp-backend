import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
} from '../controllers/admin/vendorController.js';
import { getDashboardStats } from '../controllers/admin/dashboardController.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// dashboard
router.get('/dashboard', getDashboardStats);

// vendors
router.get('/vendors', getAllVendors);
router.get('/vendors/:id', getVendorById);
router.post('/vendors/', createVendor);
router.put('/vendors/:id', updateVendor);
router.delete('/vendors/:id', deleteVendor);

export default router;