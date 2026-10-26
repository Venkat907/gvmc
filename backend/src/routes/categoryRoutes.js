const express = require('express');
const router = express.Router();
const { getCategories, getDepartments } = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/departments', getDepartments);

module.exports = router;
