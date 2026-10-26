const path = require('path');
const fs = require('fs');
const Dataset = require('../models/Dataset');
const ActivityLog = require('../models/ActivityLog');
const { parseDataFile } = require('../utils/fileParser');
const { uploadDir } = require('../middleware/upload');

// Helper to safely delete file
const safeDeleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[File] Deleted file: ${filePath}`);
    }
  } catch (err) {
    console.error(`[File] Error deleting file ${filePath}:`, err.message);
  }
};

// @desc    Get all datasets with filtering, search, sorting, pagination
// @route   GET /api/datasets
// @access  Public (published) / Admin (all)
const getDatasets = async (req, res) => {
  try {
    const {
      search,
      category,
      department,
      format,
      year,
      sort = 'newest',
      page = 1,
      limit = 9,
      status,
    } = req.query;

    const query = {};

    // By default, public users only see published datasets
    // Admin can query with status=all or status=draft
    if (status && ['published', 'draft', 'all'].includes(status)) {
      if (status !== 'all') {
        query.status = status;
      }
    } else {
      query.status = 'published';
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Department filter
    if (department && department !== 'All') {
      query.department = department;
    }

    // Format filter
    if (format && format !== 'All') {
      query.fileFormat = format.toUpperCase();
    }

    // Year filter (publicationDate or lastUpdated)
    if (year && year !== 'All') {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum + 1, 0, 1);
        query.publicationDate = { $gte: startDate, $lt: endDate };
      }
    }

    // Text search query
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { department: searchRegex },
        { category: searchRegex },
        { keywords: { $in: [searchRegex] } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'downloads') {
      sortOption = { downloadCount: -1 };
    } else if (sort === 'updated') {
      sortOption = { lastUpdated: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Dataset.countDocuments(query);
    const datasets = await Dataset.find(query)
      .select('-sampleRows') // Exclude heavy sample rows from list
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages,
      limit: limitNum,
      data: datasets,
    });
  } catch (error) {
    console.error('Error in getDatasets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve datasets.',
      error: error.message,
    });
  }
};

// @desc    Get featured datasets
// @route   GET /api/datasets/featured
// @access  Public
const getFeaturedDatasets = async (req, res) => {
  try {
    const featured = await Dataset.find({ status: 'published' })
      .select('-sampleRows')
      .sort({ downloadCount: -1, createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: featured,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured datasets.',
      error: error.message,
    });
  }
};

// @desc    Get single dataset by ID or slug
// @route   GET /api/datasets/:id
// @access  Public
const getDatasetById = async (req, res) => {
  try {
    const { id } = req.params;
    let dataset;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dataset = await Dataset.findById(id);
    } else {
      dataset = await Dataset.findOne({ slug: id });
    }

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    // Get related datasets in the same category
    const related = await Dataset.find({
      _id: { $ne: dataset._id },
      category: dataset.category,
      status: 'published',
    })
      .select('title slug department category fileFormat lastUpdated downloadCount')
      .limit(3);

    res.status(200).json({
      success: true,
      data: dataset,
      related,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dataset details.',
      error: error.message,
    });
  }
};

// @desc    Get dataset preview (parsed from actual uploaded file)
// @route   GET /api/datasets/:id/preview
// @access  Public
const getDatasetPreview = async (req, res) => {
  try {
    const { id } = req.params;
    let dataset;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dataset = await Dataset.findById(id);
    } else {
      dataset = await Dataset.findOne({ slug: id });
    }

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    // If file exists on disk, parse directly to guarantee fresh preview
    if (dataset.filePath && fs.existsSync(dataset.filePath)) {
      const parsedData = await parseDataFile(dataset.filePath, dataset.originalFileName, 50);
      return res.status(200).json({
        success: true,
        previewSource: 'live_file',
        fileFormat: dataset.fileFormat,
        columns: parsedData.columns,
        totalRows: parsedData.totalRows,
        rows: parsedData.sampleRows,
      });
    }

    // Fallback to cached sample rows in document if available
    if (dataset.sampleRows && dataset.sampleRows.length > 0) {
      return res.status(200).json({
        success: true,
        previewSource: 'cached_document',
        fileFormat: dataset.fileFormat,
        columns: dataset.columns,
        totalRows: dataset.totalRows || dataset.sampleRows.length,
        rows: dataset.sampleRows,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Preview data is currently unavailable for this dataset file.',
    });
  } catch (error) {
    console.error('Error parsing preview:', error);
    res.status(500).json({
      success: false,
      message: `Failed to generate data preview: ${error.message}`,
    });
  }
};

// @desc    Download dataset file and increment downloadCount
// @route   GET /api/datasets/:id/download
// @access  Public
const downloadDataset = async (req, res) => {
  try {
    const { id } = req.params;
    let dataset;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dataset = await Dataset.findById(id);
    } else {
      dataset = await Dataset.findOne({ slug: id });
    }

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    // Verify file exists
    if (!dataset.filePath || !fs.existsSync(dataset.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Dataset physical file was not found on server storage.',
      });
    }

    // Prevent unauthorized downloading of draft datasets unless admin token is present
    if (dataset.status === 'draft') {
      // Check auth header if present
      // For simplicity, public downloads are only for published
      return res.status(403).json({
        success: false,
        message: 'Draft datasets cannot be downloaded publicly.',
      });
    }

    // Increment download count atomically
    await Dataset.findByIdAndUpdate(dataset._id, { $inc: { downloadCount: 1 } });

    // Download file
    const safeDownloadName = dataset.originalFileName || `${dataset.slug}.${dataset.fileFormat.toLowerCase()}`;
    res.download(dataset.filePath, safeDownloadName, (err) => {
      if (err) {
        console.error('Download stream error:', err);
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download dataset file.',
      error: error.message,
    });
  }
};

// @desc    Create new dataset (with uploaded file)
// @route   POST /api/datasets
// @access  Protected (Admin)
const createDataset = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      department,
      keywords,
      sourceUrl,
      publicationDate,
      lastUpdated,
      fileFormat,
      license,
      status,
    } = req.body;

    // Validation
    if (!title || !description || !category || !department || !fileFormat) {
      if (req.file) safeDeleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, department, fileFormat.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dataset file attachment is required (CSV, JSON, or XLSX).',
      });
    }

    // Parse uploaded file to extract columns and sample preview rows
    let fileInfo = { columns: [], sampleRows: [], totalRows: 0 };
    try {
      fileInfo = await parseDataFile(req.file.path, req.file.originalname, 50);
    } catch (parseErr) {
      console.warn('Could not auto-extract preview during upload:', parseErr.message);
    }

    // Process keywords
    let parsedKeywords = [];
    if (keywords) {
      if (Array.isArray(keywords)) {
        parsedKeywords = keywords;
      } else if (typeof keywords === 'string') {
        parsedKeywords = keywords.split(',').map((k) => k.trim()).filter(Boolean);
      }
    }

    const newDataset = new Dataset({
      title,
      description,
      category,
      department,
      keywords: parsedKeywords,
      sourceUrl: sourceUrl || 'https://gvmc.gov.in',
      publicationDate: publicationDate ? new Date(publicationDate) : new Date(),
      lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
      fileFormat: fileFormat.toUpperCase(),
      filePath: req.file.path,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      license: license || 'Government Open Data License - India (GODL) / CC-BY-4.0',
      status: status || 'published',
      downloadCount: 0,
      isDemoData: false, // User/Admin uploaded data is marked as custom
      columns: fileInfo.columns,
      sampleRows: fileInfo.sampleRows,
      totalRows: fileInfo.totalRows,
    });

    const savedDataset = await newDataset.save();

    // Log admin activity
    try {
      await ActivityLog.create({
        action: 'CREATE',
        datasetId: savedDataset._id,
        datasetTitle: savedDataset.title,
        adminEmail: req.admin.email,
        details: `Created dataset "${savedDataset.title}" with ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
        ipAddress: req.ip || req.connection?.remoteAddress,
      });
    } catch (logErr) {
      console.error('Failed to log dataset creation:', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Dataset created and published successfully.',
      data: savedDataset,
    });
  } catch (error) {
    if (req.file) safeDeleteFile(req.file.path);
    console.error('Error creating dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dataset.',
      error: error.message,
    });
  }
};

// @desc    Update dataset
// @route   PUT /api/datasets/:id
// @access  Protected (Admin)
const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await Dataset.findById(id);

    if (!dataset) {
      if (req.file) safeDeleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    const {
      title,
      description,
      category,
      department,
      keywords,
      sourceUrl,
      publicationDate,
      lastUpdated,
      fileFormat,
      license,
      status,
    } = req.body;

    if (title) dataset.title = title;
    if (description) dataset.description = description;
    if (category) dataset.category = category;
    if (department) dataset.department = department;
    if (sourceUrl) dataset.sourceUrl = sourceUrl;
    if (license) dataset.license = license;
    if (status) dataset.status = status;
    if (fileFormat) dataset.fileFormat = fileFormat.toUpperCase();
    if (publicationDate) dataset.publicationDate = new Date(publicationDate);
    dataset.lastUpdated = lastUpdated ? new Date(lastUpdated) : new Date();

    if (keywords !== undefined) {
      if (Array.isArray(keywords)) {
        dataset.keywords = keywords;
      } else if (typeof keywords === 'string') {
        dataset.keywords = keywords.split(',').map((k) => k.trim()).filter(Boolean);
      }
    }

    // If new file attached, replace old file safely
    if (req.file) {
      const oldFilePath = dataset.filePath;
      dataset.filePath = req.file.path;
      dataset.originalFileName = req.file.originalname;
      dataset.fileSize = req.file.size;

      // Extract new preview
      try {
        const fileInfo = await parseDataFile(req.file.path, req.file.originalname, 50);
        dataset.columns = fileInfo.columns;
        dataset.sampleRows = fileInfo.sampleRows;
        dataset.totalRows = fileInfo.totalRows;
      } catch (parseErr) {
        console.warn('Failed to parse replacement file:', parseErr.message);
      }

      // Safely delete previous file if it was distinct
      if (oldFilePath && oldFilePath !== req.file.path) {
        safeDeleteFile(oldFilePath);
      }
    }

    const updatedDataset = await dataset.save();

    // Log admin activity
    try {
      await ActivityLog.create({
        action: 'UPDATE',
        datasetId: updatedDataset._id,
        datasetTitle: updatedDataset.title,
        adminEmail: req.admin.email,
        details: `Updated metadata ${req.file ? 'and replaced attachment' : ''} for "${updatedDataset.title}"`,
        ipAddress: req.ip || req.connection?.remoteAddress,
      });
    } catch (logErr) {
      console.error('Failed to log dataset update:', logErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Dataset updated successfully.',
      data: updatedDataset,
    });
  } catch (error) {
    if (req.file) safeDeleteFile(req.file.path);
    console.error('Error updating dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dataset.',
      error: error.message,
    });
  }
};

// @desc    Delete dataset
// @route   DELETE /api/datasets/:id
// @access  Protected (Admin)
const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await Dataset.findById(id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    const datasetTitle = dataset.title;
    const filePath = dataset.filePath;

    await Dataset.findByIdAndDelete(id);

    // Delete associated physical file from disk safely
    safeDeleteFile(filePath);

    // Log admin activity
    try {
      await ActivityLog.create({
        action: 'DELETE',
        datasetId: dataset._id,
        datasetTitle: datasetTitle,
        adminEmail: req.admin.email,
        details: `Permanently deleted dataset "${datasetTitle}" and removed storage file.`,
        ipAddress: req.ip || req.connection?.remoteAddress,
      });
    } catch (logErr) {
      console.error('Failed to log dataset deletion:', logErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Dataset "${datasetTitle}" and associated file deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete dataset.',
      error: error.message,
    });
  }
};

module.exports = {
  getDatasets,
  getFeaturedDatasets,
  getDatasetById,
  getDatasetPreview,
  downloadDataset,
  createDataset,
  updateDataset,
  deleteDataset,
};
