const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, getMe } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');

// Strict rate limiter for authentication endpoints to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes.',
  },
});

router.post('/login', loginLimiter, login);
router.get('/me', authenticateAdmin, getMe);

module.exports = router;
