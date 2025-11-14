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

import {
  getVendorContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkCreateContacts,
  bulkDeleteContacts
} from '../controllers/vendor/contactController.js'


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

// contacts routes
router.get('/contacts/', getVendorContacts);
router.get('/contacts/:id', getContactById);
router.post('/contacts/', createContact);
router.post('/contacts/bulk', bulkCreateContacts);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);
router.post('/contacts/bulk-delete', bulkDeleteContacts);
// router.delete('/contacts/bulk', bulkDeleteContacts);

export default router;