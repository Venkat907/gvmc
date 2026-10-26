const express = require('express');
const router = express.Router();
const {
  getDatasets,
  getFeaturedDatasets,
  getDatasetById,
  getDatasetPreview,
  downloadDataset,
  createDataset,
  updateDataset,
  deleteDataset,
} = require('../controllers/datasetController');
const { authenticateAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public endpoints
router.get('/', getDatasets);
router.get('/featured', getFeaturedDatasets);
router.get('/:id', getDatasetById);
router.get('/:id/preview', getDatasetPreview);
router.get('/:id/download', downloadDataset);

// Protected Admin endpoints
router.post('/', authenticateAdmin, upload.single('file'), createDataset);
router.put('/:id', authenticateAdmin, upload.single('file'), updateDataset);
router.delete('/:id', authenticateAdmin, deleteDataset);

module.exports = router;
