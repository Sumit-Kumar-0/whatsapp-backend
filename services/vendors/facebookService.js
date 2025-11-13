import axios from 'axios';
import Business from '../../models/Business.js';

const baseURL = 'https://graph.facebook.com';
const version = 'v24.0';

// Helper function to get business credentials
export const getBusinessCredentials = async (userId) => {
  try {
    const business = await Business.findOne({ userId });
    if (!business) {
      throw new Error('Business not found for user');
    }
    
    return {
      businessId: business.businessId,
      wabaId: business.wabaId,
      accessToken: business.accessToken,
      phoneNumberId: business.phoneNumberId
    };
  } catch (error) {
    console.error('Error fetching business credentials:', error);
    throw error;
  }
};

// Helper function to make API requests
const makeRequest = async (method, endpoint, data = null, accessToken) => {
  try {
    const url = `${baseURL}/${version}/${endpoint}`;
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Facebook API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Facebook API request failed');
  }
};

// Create message template in Meta
export const createMessageTemplate = async (templateData, userId) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${wabaId}/message_templates`;
    
    const components = [];

    // Header component
    if (templateData.header && templateData.header.type !== 'NONE') {
      const headerComponent = {
        type: 'HEADER',
        format: templateData.header.type.toLowerCase()
      };

      if (templateData.header.type === 'TEXT') {
        headerComponent.text = templateData.header.text;
        if (templateData.header.example?.header_handle) {
          headerComponent.example = {
            header_text: Array.isArray(templateData.header.example.header_handle) 
              ? templateData.header.example.header_handle 
              : [templateData.header.example.header_handle]
          };
        }
      } else {
        headerComponent.example = {
          header_handle: templateData.header.example?.header_handle || [templateData.header.mediaLink]
        };
      }
      components.push(headerComponent);
    }

    // Body component
    components.push({
      type: 'BODY',
      text: templateData.body.text,
      example: {
        body_text: templateData.body.example?.body_text || [templateData.body.text]
      }
    });

    // Footer component
    if (templateData.footer && templateData.footer.text) {
      components.push({
        type: 'FOOTER',
        text: templateData.footer.text
      });
    }

    // Buttons
    if (templateData.buttons && templateData.buttons.length > 0) {
      templateData.buttons.forEach(button => {
        const buttonComponent = {
          type: 'BUTTONS'
        };

        if (button.type === 'QUICK_REPLY') {
          buttonComponent.buttons = [
            {
              type: 'QUICK_REPLY',
              text: button.text
            }
          ];
        } else if (button.type === 'URL') {
          buttonComponent.buttons = [
            {
              type: 'URL',
              text: button.text,
              url: button.url,
              example: button.example || [button.url]
            }
          ];
        } else if (button.type === 'PHONE_NUMBER') {
          buttonComponent.buttons = [
            {
              type: 'PHONE_NUMBER',
              text: button.text,
              phone_number: button.phoneNumber
            }
          ];
        }

        components.push(buttonComponent);
      });
    }

    const requestData = {
      name: templateData.name,
      category: templateData.category,
      language: templateData.language,
      components
    };

    console.log('Creating template with data:', JSON.stringify(requestData, null, 2));
    
    const result = await makeRequest('POST', endpoint, requestData, accessToken);
    return result;
  } catch (error) {
    console.error('Create message template error:', error);
    throw error;
  }
};

// Delete message template from Meta
export const deleteMessageTemplate = async (templateName, userId) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${wabaId}/message_templates?name=${templateName}`;
    return await makeRequest('DELETE', endpoint, null, accessToken);
  } catch (error) {
    console.error('Delete message template error:', error);
    throw error;
  }
};

// Get template status from Meta
export const getTemplateStatus = async (userId) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${wabaId}/message_templates`;
    return await makeRequest('GET', endpoint, null, accessToken);
  } catch (error) {
    console.error('Get template status error:', error);
    throw error;
  }
};

// Get all message templates with pagination support
export const getAllMessageTemplates = async (userId, limit = 100) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    let endpoint = `${wabaId}/message_templates?limit=${limit}`;
    
    let allTemplates = [];
    let nextPage = true;
    let afterCursor = null;

    while (nextPage) {
      if (afterCursor) {
        endpoint = `${wabaId}/message_templates?limit=${limit}&after=${afterCursor}`;
      }

      const response = await makeRequest('GET', endpoint, null, accessToken);
      
      if (response.data && response.data.length > 0) {
        allTemplates = allTemplates.concat(response.data);
      }

      // Check if there's more data
      if (response.paging && response.paging.cursors && response.paging.cursors.after) {
        afterCursor = response.paging.cursors.after;
      } else {
        nextPage = false;
      }

      // Safety break to prevent infinite loops
      if (allTemplates.length >= 500) {
        console.warn('Reached maximum template limit of 500');
        break;
      }
    }

    return {
      data: allTemplates,
      paging: {
        total: allTemplates.length
      }
    };
  } catch (error) {
    console.error('Get all message templates error:', error);
    throw error;
  }
};

// Get single template by name
export const getMessageTemplateByName = async (templateName, userId) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${wabaId}/message_templates?name=${templateName}`;
    return await makeRequest('GET', endpoint, null, accessToken);
  } catch (error) {
    console.error('Get message template by name error:', error);
    throw error;
  }
};

// Get WABA details
export const getWABADetails = async (userId) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${wabaId}?fields=name,id,timezone_id,message_template_namespace,owner_business_info,on_behalf_of_business_info,account_review_status,owner_business,primary_funding_id,allowed_wa_phone_numbers`;
    return await makeRequest('GET', endpoint, null, accessToken);
  } catch (error) {
    console.error('Get WABA details error:', error);
    throw error;
  }
};

// Get phone numbers for WABA
export const getPhoneNumbers = async (userId) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${wabaId}/phone_numbers?fields=verified_name,display_phone_number,quality_rating,id`;
    return await makeRequest('GET', endpoint, null, accessToken);
  } catch (error) {
    console.error('Get phone numbers error:', error);
    throw error;
  }
};

// Send test message
export const sendTestMessage = async (userId, messageData) => {
  try {
    const { phoneNumberId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${phoneNumberId}/messages`;
    return await makeRequest('POST', endpoint, messageData, accessToken);
  } catch (error) {
    console.error('Send test message error:', error);
    throw error;
  }
};

// Get template analytics
export const getTemplateAnalytics = async (userId, templateIds, startDate, endDate) => {
  try {
    const { wabaId, accessToken } = await getBusinessCredentials(userId);
    const endpoint = `${wabaId}/message_template_analytics?template_ids=${templateIds.join(',')}&start=${startDate}&end=${endDate}`;
    return await makeRequest('GET', endpoint, null, accessToken);
  } catch (error) {
    console.error('Get template analytics error:', error);
    throw error;
  }
};

// Get business info
export const getBusinessInfo = async (userId) => {
  try {
    return await getBusinessCredentials(userId);
  } catch (error) {
    console.error('Get business info error:', error);
    throw error;
  }
};

// Verify webhook
export const verifyWebhook = async (mode, token, challenge) => {
  try {
    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return challenge;
      } else {
        throw new Error('Verification failed');
      }
    }
  } catch (error) {
    console.error('Verify webhook error:', error);
    throw error;
  }
};

// Export all functions
export default {
  createMessageTemplate,
  deleteMessageTemplate,
  getTemplateStatus,
  getAllMessageTemplates,
  getMessageTemplateByName,
  getWABADetails,
  getPhoneNumbers,
  sendTestMessage,
  getTemplateAnalytics,
  getBusinessInfo,
  verifyWebhook,
  getBusinessCredentials // ✅ Export this function for template controller
};