const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, hospitalController.getAllHospitals);
router.get('/:id', verifyToken, hospitalController.getHospitalById);
router.post('/', verifyToken, requireRole(['Admin']), hospitalController.createHospital);
router.put('/:id', verifyToken, hospitalController.updateHospital);
router.delete('/:id', verifyToken, requireRole(['Admin']), hospitalController.deleteHospital);

module.exports = router;
