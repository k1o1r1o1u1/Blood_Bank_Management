const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Public overview stats
router.get('/stats', dashboardController.getDashboardStats);

// Role-specific dashboards (guarded by JWT and Role)
router.get('/admin', verifyToken, requireRole(['Admin']), dashboardController.getAdminDashboard);
router.get('/staff', verifyToken, requireRole(['Admin', 'Staff']), dashboardController.getStaffDashboard);
router.get('/hospital', verifyToken, requireRole(['Admin', 'Hospital']), dashboardController.getHospitalDashboard);
router.get('/donor', verifyToken, requireRole(['Admin', 'Donor']), dashboardController.getDonorDashboard);

module.exports = router;
