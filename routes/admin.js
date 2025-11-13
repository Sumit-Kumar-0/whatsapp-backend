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
import {
  getAllConfigs,
  getConfigByKey,
  upsertConfig,
  deleteConfig,
  getPublicConfigs,
  // initializeDefaults
} from '../controllers/admin/configController.js';
import {
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  // initializeDefaults
} from '../controllers/admin/subscriptionPlanController.js';

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

// configurations
router.get('/configs/', getAllConfigs);
// router.get('/config/initialize', initializeDefaults);
router.get('/config/:key', getConfigByKey);
router.post('/config/', upsertConfig);
router.put('/config/:key', upsertConfig);
router.delete('/config/:id', deleteConfig);

// subscription plans
router.get('/subscription-plans/', getAllSubscriptionPlans);
// router.get('/subscription-plans/initialize', initializeDefaults);
router.get('/subscription-plans/:id', getSubscriptionPlanById);
router.post('/subscription-plans/', createSubscriptionPlan);
router.put('/subscription-plans/:id', updateSubscriptionPlan);
router.delete('/subscription-plans/:id', deleteSubscriptionPlan);


export default router;