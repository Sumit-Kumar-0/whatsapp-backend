import Template from '../../models/Template.js';
import { 
  createMessageTemplate, 
  deleteMessageTemplate,
  getAllMessageTemplates,
  getBusinessCredentials
} from '../../services/vendors/facebookService.js';

// Get all templates with filters
export const getAllTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Use userId from authenticated request
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Build filter
    const filter = { userId };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'body.text': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Pagination
    const skip = (page - 1) * limit;
    
    // Get templates
    const templates = await Template.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Template.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const template = await Template.findOne({
      _id: req.params.id,
      userId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// Create new template
export const createTemplate = async (req, res) => {
  try {
    const {
      name,
      category,
      language,
      header,
      body,
      footer,
      buttons
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get business credentials for wabaId and businessId
    const businessCreds = await getBusinessCredentials(userId);

    // Check if template with same name exists
    const existingTemplate = await Template.findOne({
      name,
      userId
    });

    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Template with this name already exists'
      });
    }

    // Create template
    const template = new Template({
      name,
      category,
      language,
      header: header || { type: 'NONE' },
      body,
      footer: footer || {},
      buttons: buttons || [],
      userId,
      wabaId: businessCreds.wabaId,
      businessId: businessCreds.businessId,
      status: 'DRAFT'
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const {
      name,
      category,
      language,
      header,
      body,
      footer,
      buttons,
      status
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find template
    let template = await Template.findOne({
      _id: req.params.id,
      userId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== template.name) {
      const existingTemplate = await Template.findOne({
        name,
        userId,
        _id: { $ne: req.params.id }
      });

      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: 'Template with this name already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      category,
      language,
      header,
      body,
      footer,
      buttons,
      updatedAt: new Date()
    };

    // Handle status changes
    if (status && status !== template.status) {
      updateData.status = status;
      
      if (status === 'PENDING') {
        updateData.submittedAt = new Date();
      } else if (status === 'APPROVED') {
        updateData.approvedAt = new Date();
      }
    }

    // Update template
    template = await Template.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// Submit template to Meta for approval
export const submitTemplate = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const template = await Template.findOne({
      _id: req.params.id,
      userId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (template.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only DRAFT templates can be submitted'
      });
    }

    console.log('Submitting template to Meta:', template.name);

    // Submit to Meta WhatsApp API using updated service
    const metaResponse = await createMessageTemplate(
      template.toObject(), // Convert to plain object
      userId // Pass userId instead of wabaId
    );

    console.log('Meta API response:', metaResponse);

    // Update template with Meta response
    template.status = 'PENDING';
    template.templateId = metaResponse.id;
    template.submittedAt = new Date();
    await template.save();

    res.status(200).json({
      success: true,
      message: 'Template submitted for Meta approval',
      data: template,
      metaResponse
    });
  } catch (error) {
    console.error('Submit template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit template to Meta'
    });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const template = await Template.findOne({
      _id: req.params.id,
      userId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // If template is approved, delete from Meta as well
    if (template.status === 'APPROVED' && template.templateId) {
      try {
        await deleteMessageTemplate(
          template.name,
          userId // Pass userId instead of wabaId
        );
      } catch (metaError) {
        console.error('Meta deletion error:', metaError);
        // Continue with local deletion even if Meta deletion fails
      }
    }

    await Template.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// Get template analytics
export const getTemplateAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const analytics = await Template.aggregate([
      {
        $match: {
          userId,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Template analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// Sync templates from Meta and save to database
export const syncTemplatesFromMeta = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Get business credentials
    const businessCreds = await getBusinessCredentials(userId);
    
    // Get templates from Meta
    const metaTemplates = await getAllMessageTemplates(userId);
    
    if (!metaTemplates.data || metaTemplates.data.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No templates found in Meta',
        data: {
          metaTemplates: [],
          savedTemplates: [],
          totalSynced: 0
        }
      });
    }

    // Process and save templates to local database
    const savedTemplates = await processAndSaveTemplates(
      metaTemplates.data, 
      userId, 
      businessCreds.wabaId, 
      businessCreds.businessId
    );
    
    res.status(200).json({
      success: true,
      message: `Successfully synced ${savedTemplates.length} templates from Meta`,
      data: {
        metaTemplates: metaTemplates.data,
        savedTemplates,
        totalSynced: savedTemplates.length
      }
    });
  } catch (error) {
    console.error('Sync templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync templates from Meta'
    });
  }
};

// Helper function to process and save templates
const processAndSaveTemplates = async (metaTemplates, userId, wabaId, businessId) => {
  const savedTemplates = [];
  
  for (const metaTemplate of metaTemplates) {
    try {
      // Extract components according to model structure
      const header = extractHeaderComponent(metaTemplate.components);
      const body = extractBodyComponent(metaTemplate.components);
      const footer = extractFooterComponent(metaTemplate.components);
      const buttons = extractButtons(metaTemplate.components);
      
      // Check if template already exists by templateId or name
      let template = await Template.findOne({
        $or: [
          { templateId: metaTemplate.id },
          { name: metaTemplate.name, wabaId, userId }
        ]
      });
      
      const templateData = {
        name: metaTemplate.name,
        category: metaTemplate.category,
        language: metaTemplate.language,
        status: metaTemplate.status,
        header,
        body,
        footer,
        buttons,
        templateId: metaTemplate.id,
        userId,
        wabaId,
        businessId,
        updatedAt: new Date()
      };

      // Set timestamps based on status
      if (metaTemplate.status !== 'DRAFT') {
        templateData.submittedAt = template?.submittedAt || new Date();
      }
      if (metaTemplate.status === 'APPROVED') {
        templateData.approvedAt = template?.approvedAt || new Date();
      }

      if (template) {
        // Update existing template
        template = await Template.findByIdAndUpdate(
          template._id,
          { $set: templateData },
          { new: true, runValidators: true }
        );
      } else {
        // Create new template
        templateData.createdAt = new Date();
        template = new Template(templateData);
        await template.save();
      }
      
      savedTemplates.push(template);
      
    } catch (error) {
      console.error(`Error processing template ${metaTemplate.name}:`, error);
      // Continue with next template even if one fails
    }
  }
  
  return savedTemplates;
};

// Helper functions to extract components
const extractHeaderComponent = (components) => {
  const headerComponent = components.find(comp => comp.type === 'HEADER');
  if (!headerComponent) return { type: 'NONE' };
  
  const headerData = {
    type: headerComponent.format ? headerComponent.format.toUpperCase() : 'TEXT'
  };
  
  if (headerComponent.text) {
    headerData.text = headerComponent.text;
  }
  
  if (headerComponent.example) {
    headerData.example = { header_handle: [] };
    
    if (headerComponent.example.header_handle) {
      headerData.example.header_handle = Array.isArray(headerComponent.example.header_handle) 
        ? headerComponent.example.header_handle 
        : [headerComponent.example.header_handle];
      
      // Extract media link for non-text headers
      if (headerComponent.format !== 'TEXT' && headerData.example.header_handle[0]) {
        headerData.mediaLink = headerData.example.header_handle[0];
      }
    } else if (headerComponent.example.header_text) {
      headerData.example.header_handle = Array.isArray(headerComponent.example.header_text) 
        ? headerComponent.example.header_text 
        : [headerComponent.example.header_text];
    }
  }
  
  return headerData;
};

const extractBodyComponent = (components) => {
  const bodyComponent = components.find(comp => comp.type === 'BODY');
  if (!bodyComponent) return { text: '' };
  
  const bodyData = {
    text: bodyComponent.text || ''
  };
  
  if (bodyComponent.example) {
    bodyData.example = { body_text: [] };
    
    if (bodyComponent.example.body_text) {
      bodyData.example.body_text = Array.isArray(bodyComponent.example.body_text) 
        ? bodyComponent.example.body_text 
        : [bodyComponent.example.body_text];
    }
  }
  
  return bodyData;
};

const extractFooterComponent = (components) => {
  const footerComponent = components.find(comp => comp.type === 'FOOTER');
  if (!footerComponent) return { text: '' };
  
  return {
    text: footerComponent.text || ''
  };
};

const extractButtons = (components) => {
  const buttonsComponent = components.find(comp => comp.type === 'BUTTONS');
  if (!buttonsComponent || !buttonsComponent.buttons) return [];
  
  return buttonsComponent.buttons.map(button => {
    const buttonData = {
      type: button.type,
      text: button.text
    };
    
    if (button.type === 'URL') {
      buttonData.url = button.url;
      if (button.example) {
        buttonData.example = Array.isArray(button.example) ? button.example : [button.example];
      }
    } else if (button.type === 'PHONE_NUMBER') {
      buttonData.phoneNumber = button.phone_number;
    }
    
    return buttonData;
  });
};