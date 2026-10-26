const ActivityLog = require('../models/ActivityLog');

// @desc    Get recent admin activity logs
// @route   GET /api/activity
// @access  Protected (Admin)
const getActivityLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative activity log.',
      error: error.message,
    });
  }
};

module.exports = { getActivityLogs };
