import bcrypt from 'bcryptjs';
import User from "../../models/User.js";

// Get all vendors
export const getAllVendors = async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' }).select('-password -verificationCode');
        res.status(200).json({
            success: true,
            data: vendors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Get vendor by ID
export const getVendorById = async (req, res) => {
    try {
        const vendor = await User.findOne({
            _id: req.params.id,
            role: 'vendor'
        }).select('-password -verificationCode');

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Create new vendor
export const createVendor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            whatsappNumber,
            whatsappCountryCode,
            businessName,
            businessCountry,
            businessWebsite,
            useCase,
            contactSize,
            monthlyBudget,
            businessCategory,
            companySize,
            roleInCompany,
            referralSource,
            status = 'active'
        } = req.body;

        // Check if vendor already exists with this email
        const existingVendor = await User.findOne({
            email: email.toLowerCase(),
            role: 'vendor'
        });

        if (existingVendor) {
            return res.status(400).json({
                success: false,
                message: 'Vendor with this email already exists'
            });
        }

        // Create new vendor
        const vendor = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            whatsappNumber,
            whatsappCountryCode,
            businessName,
            businessCountry,
            businessWebsite,
            useCase,
            contactSize,
            monthlyBudget,
            businessCategory,
            companySize,
            roleInCompany,
            referralSource,
            status,
            role: 'vendor',
            isEmailVerified: false
        });

        await vendor.save();

        // Remove password from response
        const vendorResponse = vendor.toJSON();

        res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: vendorResponse
        });
    } catch (error) {
        console.error('Create vendor error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// Update vendor
export const updateVendor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            whatsappNumber,
            whatsappCountryCode,
            businessName,
            businessCountry,
            businessWebsite,
            useCase,
            contactSize,
            monthlyBudget,
            businessCategory,
            companySize,
            roleInCompany,
            referralSource,
            status
        } = req.body;

        // Find vendor
        let vendor = await User.findOne({
            _id: req.params.id,
            role: 'vendor'
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== vendor.email) {
            const existingVendor = await User.findOne({
                email: email.toLowerCase(),
                role: 'vendor',
                _id: { $ne: req.params.id }
            });

            if (existingVendor) {
                return res.status(400).json({
                    success: false,
                    message: 'Vendor with this email already exists'
                });
            }
        }

        // Prepare update data
        const updateData = {
            firstName,
            lastName,
            email: email ? email.toLowerCase() : vendor.email,
            whatsappNumber,
            whatsappCountryCode,
            businessName,
            businessCountry,
            businessWebsite,
            useCase,
            contactSize,
            monthlyBudget,
            businessCategory,
            companySize,
            roleInCompany,
            referralSource,
            status
        };

        // Only update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(password, salt);
            //   updateData.password = password;
        }

        // Update vendor
        vendor = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -verificationCode');

        res.status(200).json({
            success: true,
            message: 'Vendor updated successfully',
            data: vendor
        });
    } catch (error) {
        console.error('Update vendor error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// Delete vendor
export const deleteVendor = async (req, res) => {
    try {
        const vendor = await User.findOne({
            _id: req.params.id,
            role: 'vendor'
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully'
        });
    } catch (error) {
        console.error('Delete vendor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};