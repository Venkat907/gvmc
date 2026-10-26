const Dataset = require('../models/Dataset');

const OFFICIAL_CATEGORIES = [
  {
    name: 'Water Supply',
    slug: 'water-supply',
    description: 'Reservoir monitoring, bulk water transmission, distribution pipeline networks, and daily supply timings across zones.',
    icon: 'Droplets',
    color: 'blue',
  },
  {
    name: 'Waste Management',
    slug: 'waste-management',
    description: 'Solid waste generation, door-to-door segregation, transfer stations, and Kapuluppada waste-to-energy plant metrics.',
    icon: 'Trash2',
    color: 'emerald',
  },
  {
    name: 'Roads and Infrastructure',
    slug: 'roads-and-infrastructure',
    description: 'Major arterial corridors, BRTS road networks, street lighting, pothole repairs, and civic civil works projects.',
    icon: 'HardHat',
    color: 'amber',
  },
  {
    name: 'Public Health',
    slug: 'public-health',
    description: 'Urban Primary Health Centres (UPHCs), vector control, seasonal disease surveillance, and immunization coverage.',
    icon: 'Activity',
    color: 'rose',
  },
  {
    name: 'Transportation',
    slug: 'transportation',
    description: 'City bus networks, EV charging hubs, transit ridership, multi-modal interchanges, and traffic density data.',
    icon: 'Bus',
    color: 'indigo',
  },
  {
    name: 'Revenue and Taxation',
    slug: 'revenue-and-taxation',
    description: 'Property tax assessments, municipal trade licenses, user charges, digital revenue collections, and ward arrears.',
    icon: 'Receipt',
    color: 'teal',
  },
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Continuous Ambient Air Quality (AQI), coastal sea-breeze monitoring, noise levels, and urban green cover inventory.',
    icon: 'Trees',
    color: 'green',
  },
  {
    name: 'Urban Planning',
    slug: 'urban-planning',
    description: 'Master Plan 2030 land-use zones, building plan approvals, town planning permissions, and coastal CRZ demarcations.',
    icon: 'Building2',
    color: 'purple',
  },
];

// @desc    Get all categories with dynamic dataset counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Aggregate dataset counts by category for published datasets
    const counts = await Dataset.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const categoriesWithCounts = OFFICIAL_CATEGORIES.map((cat) => ({
      ...cat,
      datasetCount: countMap[cat.name] || 0,
    }));

    res.status(200).json({
      success: true,
      data: categoriesWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
      error: error.message,
    });
  }
};

// @desc    Get all departments with dynamic dataset counts
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res) => {
  try {
    const departments = await Dataset.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: departments.map((d) => ({
        name: d._id,
        datasetCount: d.count,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments.',
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getDepartments,
  OFFICIAL_CATEGORIES,
};
