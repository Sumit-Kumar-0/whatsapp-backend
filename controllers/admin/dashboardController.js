import User from "../../models/User.js";
import Campaign from "../../models/Campaign.js";
import Message from "../../models/Message.js";
import Contact from "../../models/Contact.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Vendors - REAL DATA
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    
    // 2. Active Vendors - REAL DATA
    const activeVendors = await User.countDocuments({ 
      role: 'vendor', 
      status: 'active' 
    });

    // 3. Total Contacts - REAL DATA
    const totalContacts = await Contact.countDocuments();

    // 4. Total Campaigns - REAL DATA
    const totalCampaigns = await Campaign.countDocuments();

    // 5. Messages in Queue - REAL DATA
    const messagesInQueue = await Message.countDocuments({ status: 'queued' });

    // 6. Messages Processed - REAL DATA
    const messagesProcessed = await Message.countDocuments({ 
      status: { $in: ['sent', 'delivered'] } 
    });

    // 7. Vendor Growth Data - LAST 6 MONTHS REAL DATA
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);
    
    const sixMonthsAgo = new Date(currentDate);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    console.log('Date Range:', {
      start: sixMonthsAgo.toISOString(),
      end: currentDate.toISOString()
    });

    // Database se vendor growth data lao - REAL DATA
    const vendorGrowth = await User.aggregate([
      {
        $match: {
          role: 'vendor',
          createdAt: { 
            $gte: sixMonthsAgo,
            $lte: currentDate
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    console.log('Vendor Growth from DB:', vendorGrowth);

    // Create map for easy lookup
    const vendorGrowthMap = new Map();
    vendorGrowth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      vendorGrowthMap.set(key, item.count);
      console.log(`Key: ${key} -> Count: ${item.count}`);
    });

    // Generate last 6 months array with proper formatting
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const vendorGrowthData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-based month for MongoDB
      const key = `${year}-${month}`;
      
      const monthData = {
        month: monthNames[date.getMonth()],
        vendors: vendorGrowthMap.get(key) || 0
      };
      
      console.log(`Month: ${monthData.month}, Key: ${key}, Count: ${monthData.vendors}`);
      vendorGrowthData.push(monthData);
    }

    console.log('Final Vendor Growth Data:', vendorGrowthData);

    // 8. Additional Real Stats
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const completedCampaigns = await Campaign.countDocuments({ status: 'completed' });
    
    // Delivery rate calculation
    const messageStats = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    let deliveredCount = 0;
    let totalSentMessages = 0;
    messageStats.forEach(stat => {
      if (stat._id === 'delivered') deliveredCount = stat.count;
      if (stat._id !== 'queued') totalSentMessages += stat.count;
    });
    
    const deliveryRatePercent = totalSentMessages > 0 ? 
      Math.round((deliveredCount / totalSentMessages) * 100) : 0;

    // Final Response
    res.status(200).json({
      success: true,
      data: {
        // Basic Stats
        totalVendors,
        activeVendors,
        totalContacts,
        totalCampaigns,
        messagesInQueue,
        messagesProcessed,
        
        // Vendor Growth - PURE REAL DATA based on createdAt
        vendorGrowth: vendorGrowthData,
        
        // Additional Real Stats
        campaignStats: {
          active: activeCampaigns,
          completed: completedCampaigns,
          draft: totalCampaigns - activeCampaigns - completedCampaigns
        },
        performance: {
          deliveryRate: deliveryRatePercent,
          queuedMessages: messagesInQueue
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};