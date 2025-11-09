import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  submitTemplate,
  getTemplateAnalytics,
  syncTemplatesFromMeta
} from '../controllers/vendor/templateController.js';

const router = express.Router();

// Protect all vendor routes
router.use(protect);
router.use(authorize('vendor', 'admin'));

// Template routes
router.get('/templates', getAllTemplates);
router.get('/templates/analytics', getTemplateAnalytics);
router.get('/templates/:id', getTemplateById);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.post('/templates/:id/submit', submitTemplate);
router.delete('/templates/:id', deleteTemplate);
router.post('/templates/sync', syncTemplatesFromMeta);

export default router;