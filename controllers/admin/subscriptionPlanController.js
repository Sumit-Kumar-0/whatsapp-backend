import * as subscriptionPlanService from "../../services/subscriptionPlanService.js";

// Get all subscription plans
export const getAllSubscriptionPlans = async (req, res) => {
  try {
    const plans = await subscriptionPlanService.getAllSubscriptionPlans();
    
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscription plans'
    });
  }
};

// Get subscription plan by ID
export const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await subscriptionPlanService.getSubscriptionPlanById(id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Get subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscription plan'
    });
  }
};

// Create subscription plan
export const createSubscriptionPlan = async (req, res) => {
  try {
    const planData = req.body;
    
    const plan = await subscriptionPlanService.createSubscriptionPlan(planData);
    
    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating subscription plan'
    });
  }
};

// Update subscription plan
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const planData = req.body;
    
    const plan = await subscriptionPlanService.updateSubscriptionPlan(id, planData);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating subscription plan'
    });
  }
};

// Delete subscription plan
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await subscriptionPlanService.deleteSubscriptionPlan(id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting subscription plan'
    });
  }
};

// Initialize default subscription plans
// export const initializeDefaults = async (req, res) => {
//   try {
//     await subscriptionPlanService.initializeDefaultSubscriptionPlans();
    
//     res.status(200).json({
//       success: true,
//       message: 'Default subscription plans initialized successfully'
//     });
//   } catch (error) {
//     console.error('Initialize subscription plans error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while initializing subscription plans'
//     });
//   }
// };