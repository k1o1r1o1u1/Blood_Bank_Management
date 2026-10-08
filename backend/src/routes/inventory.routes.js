const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

router.get('/', inventoryController.getInventorySummary);
router.get('/units/available', inventoryController.getAvailableUnits);
router.get('/:bloodGroup', inventoryController.getInventoryByGroup);

module.exports = router;
