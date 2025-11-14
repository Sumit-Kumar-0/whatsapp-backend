import Contact from "../../models/Contact.js";

// Get vendor contacts with pagination and search
export const getVendorContacts = async (vendorId, options = {}) => {
  const { page = 1, limit = 10, search = '', category = '' } = options;
  
  const query = { vendorId };
  
  // Category filter
  if (category) {
    query.category = category;
  }
  
  // Search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }
  
  const contacts = await Contact.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Contact.countDocuments(query);
  
  return {
    contacts,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Get contact by ID and vendor ID
export const getContactById = async (contactId, vendorId) => {
  return await Contact.findOne({ _id: contactId, vendorId });
};

// Create new contact
export const createContact = async (contactData) => {
  const contact = new Contact(contactData);
  return await contact.save();
};

// Update contact
export const updateContact = async (contactId, vendorId, updateData) => {
  return await Contact.findOneAndUpdate(
    { _id: contactId, vendorId },
    updateData,
    { new: true, runValidators: true }
  );
};

// Delete contact
export const deleteContact = async (contactId, vendorId) => {
  return await Contact.findOneAndDelete({ _id: contactId, vendorId });
};

// Bulk create contacts
export const bulkCreateContacts = async (contacts, vendorId) => {
  const contactsWithVendor = contacts.map(contact => ({
    ...contact,
    vendorId
  }));
  
  const result = {
    created: 0,
    duplicates: 0,
    errors: []
  };
  
  for (const contact of contactsWithVendor) {
    try {
      await Contact.create(contact);
      result.created++;
    } catch (error) {
      if (error.code === 11000) {
        result.duplicates++;
      } else {
        result.errors.push({
          contact,
          error: error.message
        });
      }
    }
  }
  
  return result;
};

// Bulk delete contacts
export const bulkDeleteContacts = async (contactIds, vendorId) => {
  const result = {
    deleted: 0,
    notFound: 0,
    errors: []
  };
  
  for (const contactId of contactIds) {
    try {
      const contact = await Contact.findOneAndDelete({ _id: contactId, vendorId });
      
      if (contact) {
        result.deleted++;
      } else {
        result.notFound++;
      }
    } catch (error) {
      result.errors.push({
        contactId,
        error: error.message
      });
    }
  }
  
  return result;
};