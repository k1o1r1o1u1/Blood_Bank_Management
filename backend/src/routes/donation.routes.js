const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, donationController.getAllDonations);
router.get('/:id', verifyToken, donationController.getDonationById);
router.post('/', verifyToken, requireRole(['Admin', 'Staff']), donationController.createDonation);
router.put('/:id/screening', verifyToken, requireRole(['Admin', 'Staff']), donationController.updateScreeningStatus);

module.exports = router;
