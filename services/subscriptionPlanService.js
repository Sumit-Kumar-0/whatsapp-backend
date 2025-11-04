import SubscriptionPlan from "../models/SubscriptionPlan.js";

// Get all subscription plans
export const getAllSubscriptionPlans = async () => {
  const plans = await SubscriptionPlan.find().sort({ position: 1 });
  return plans;
};

// Get subscription plan by ID
export const getSubscriptionPlanById = async (planId) => {
  const plan = await SubscriptionPlan.findById(planId);
  return plan;
};

// Create subscription plan
export const createSubscriptionPlan = async (planData) => {
  const plan = new SubscriptionPlan(planData);
  await plan.save();
  return plan;
};

// Update subscription plan
export const updateSubscriptionPlan = async (planId, planData) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    planId,
    planData,
    { new: true, runValidators: true }
  );
  return plan;
};

// Delete subscription plan
export const deleteSubscriptionPlan = async (planId) => {
  const plan = await SubscriptionPlan.findByIdAndDelete(planId);
  return plan;
};

// Initialize default subscription plans
// export const initializeDefaultSubscriptionPlans = async () => {
//   const defaultPlans = [
//     {
//       name: 'Free',
//       description: 'Basic features for getting started',
//       contactsLimit: 1000,
//       monthlyPrice: 0,
//       yearlyPrice: 0,
//       features: [
//         '1,000 stored contacts',
//         'Basic messaging features',
//         'Standard support',
//         'Limited analytics'
//       ],
//       position: 1,
//       isActive: true
//     },
//     {
//       name: 'Basic',
//       description: 'Essential features for growing businesses',
//       contactsLimit: 10000,
//       monthlyPrice: 999,
//       yearlyPrice: 9999,
//       features: [
//         '10,000 stored contacts',
//         'Advanced messaging features',
//         'Priority support',
//         'Basic analytics',
//         'Bulk messaging',
//         'Template messages'
//       ],
//       position: 2,
//       isActive: true
//     },
//     {
//       name: 'Premium',
//       description: 'Complete solution for enterprises',
//       contactsLimit: 50000,
//       monthlyPrice: 1999,
//       yearlyPrice: 19999,
//       features: [
//         '50,000 stored contacts',
//         'All messaging features',
//         '24/7 priority support',
//         'Advanced analytics',
//         'API access',
//         'Custom integrations',
//         'Dedicated account manager'
//       ],
//       position: 3,
//       isActive: true
//     }
//   ];

//   // Delete existing plans and create new ones
//   await SubscriptionPlan.deleteMany({});
  
//   for (const plan of defaultPlans) {
//     await createSubscriptionPlan(plan);
//   }

//   console.log('Default subscription plans initialized');
// };