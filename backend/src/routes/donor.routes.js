const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, donorController.getAllDonors);
router.get('/:id', verifyToken, donorController.getDonorById);
router.post('/', verifyToken, requireRole(['Admin', 'Staff']), donorController.createDonor);
router.put('/:id', verifyToken, donorController.updateDonor);
router.delete('/:id', verifyToken, requireRole(['Admin']), donorController.deleteDonor);

module.exports = router;
