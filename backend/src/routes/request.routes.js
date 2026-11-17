const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, requestController.getAllRequests);
router.get('/:id', verifyToken, requestController.getRequestById);
router.post('/', verifyToken, requireRole(['Admin', 'Staff', 'Hospital']), requestController.createRequest);
router.put('/:id', verifyToken, requireRole(['Admin', 'Staff']), requestController.updateRequest);

module.exports = router;
