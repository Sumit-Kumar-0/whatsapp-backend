import * as contactService from "../../services/vendors/contactService.js";

// Get all contacts for vendor
export const getVendorContacts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 10, search, category } = req.query;
    
    const contacts = await contactService.getVendorContacts(vendorId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category
    });
    
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
};

// Get contact by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    const contact = await contactService.getContactById(id, vendorId);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact'
    });
  }
};

// Create new contact
export const createContact = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      country,
      email,
      company,
      category,
      tags,
      source,
      notes
    } = req.body;
    
    // Validation
    if (!firstName || !countryCode || !phoneNumber || !country) {
      return res.status(400).json({
        success: false,
        message: 'First name, country code, phone number and country are required'
      });
    }
    
    const contact = await contactService.createContact({
      firstName,
      lastName,
      countryCode,
      phoneNumber,
      country,
      email,
      company,
      category,
      tags,
      source,
      notes,
      vendorId
    });
    
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this phone number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating contact'
    });
  }
};

// Update contact
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const updateData = req.body;
    
    const contact = await contactService.updateContact(id, vendorId, updateData);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this phone number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact'
    });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    const contact = await contactService.deleteContact(id, vendorId);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact'
    });
  }
};

// Bulk create contacts
export const bulkCreateContacts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { contacts } = req.body;
    
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contacts array is required'
      });
    }
    
    const result = await contactService.bulkCreateContacts(contacts, vendorId);
    
    res.status(201).json({
      success: true,
      message: `Successfully created ${result.created} contacts, ${result.duplicates} duplicates skipped`,
      data: result
    });
  } catch (error) {
    console.error('Bulk create contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating contacts'
    });
  }
};