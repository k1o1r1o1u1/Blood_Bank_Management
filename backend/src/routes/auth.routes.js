const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getProfile);
router.get('/staff', authController.getAllStaff);

module.exports = router;
