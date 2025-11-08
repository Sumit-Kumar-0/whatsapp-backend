import * as configService from "../../services/configService.js";

// Get all configs (admin only)
export const getAllConfigs = async (req, res) => {
  try {
    const includeSensitive = req.query.includeSensitive === 'true';
    const configs = await configService.getAllConfigs(includeSensitive);
    
    res.status(200).json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Get all configs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching configurations'
    });
  }
};

// Get config by key
export const getConfigByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const includeSensitive = req.query.includeSensitive === 'true';
    
    const config = await configService.getConfigByKey(key, includeSensitive);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get config by key error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching configuration'
    });
  }
};

// Create or update config
export const upsertConfig = async (req, res) => {
  try {
    const { key, value, description, category, isEncrypted, isPublic } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required'
      });
    }
    
    const config = await configService.upsertConfig(
      key, 
      value, 
      description, 
      category, 
      isEncrypted, 
      isPublic
    );
    
    res.status(200).json({
      success: true,
      message: 'Configuration saved successfully',
      data: config
    });
  } catch (error) {
    console.error('Upsert config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving configuration'
    });
  }
};

// Delete config
export const deleteConfig = async (req, res) => {
  try {
    const { key } = req.params;
    
    const config = await configService.deleteConfig(key);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting configuration'
    });
  }
};

// Get public configs (for frontend)
export const getPublicConfigs = async (req, res) => {
  try {
    const configs = await configService.getPublicConfigs();
    
    res.status(200).json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Get public configs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public configurations'
    });
  }
};
