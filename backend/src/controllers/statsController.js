const Dataset = require('../models/Dataset');
const { OFFICIAL_CATEGORIES } = require('./categoryController');

// @desc    Get portal overall statistics (for home page & admin dashboard)
// @route   GET /api/stats
// @access  Public (basic stats) / Admin (full stats)
const getStats = async (req, res) => {
  try {
    const isPublic = !req.headers.authorization;
    const filter = isPublic ? { status: 'published' } : {};

    const [
      totalDatasets,
      publishedDatasets,
      draftDatasets,
      downloadsAgg,
      formatsAgg,
      categoriesAgg,
      departmentsAgg,
      recentDatasets,
    ] = await Promise.all([
      Dataset.countDocuments({}),
      Dataset.countDocuments({ status: 'published' }),
      Dataset.countDocuments({ status: 'draft' }),
      Dataset.aggregate([
        { $match: filter },
        { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } },
      ]),
      Dataset.aggregate([
        { $match: filter },
        { $group: { _id: '$fileFormat', count: { $sum: 1 } } },
      ]),
      Dataset.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Dataset.aggregate([
        { $match: filter },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      Dataset.find(filter)
        .select('title slug department category fileFormat downloadCount createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalDownloads = downloadsAgg[0]?.totalDownloads || 0;

    // Formats mapping
    const formats = {
      CSV: 0,
      JSON: 0,
      XLSX: 0,
    };
    formatsAgg.forEach((f) => {
      if (f._id) formats[f._id] = f.count;
    });

    // Chart-ready category data
    const categoryDistribution = OFFICIAL_CATEGORIES.map((cat) => {
      const found = categoriesAgg.find((c) => c._id === cat.name);
      return {
        name: cat.name,
        count: found ? found.count : 0,
        color: cat.color,
      };
    });

    // Department chart data
    const departmentDistribution = departmentsAgg.map((d) => ({
      name: d._id,
      count: d.count,
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalDatasets: isPublic ? publishedDatasets : totalDatasets,
        publishedDatasets,
        draftDatasets,
        totalCategories: OFFICIAL_CATEGORIES.length,
        totalDepartments: departmentsAgg.length,
        totalDownloads,
        formats,
        categoryDistribution,
        departmentDistribution,
        recentDatasets,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve portal statistics.',
      error: error.message,
    });
  }
};

module.exports = { getStats };
