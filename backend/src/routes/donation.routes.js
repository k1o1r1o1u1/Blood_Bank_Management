const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');

router.get('/', donationController.getAllDonations);
router.get('/:id', donationController.getDonationById);
router.post('/', donationController.createDonation);
router.put('/:id/screening', donationController.updateScreeningStatus);

module.exports = router;
