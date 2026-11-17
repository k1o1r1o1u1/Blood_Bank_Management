const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, requireRole(['Admin', 'Staff']), issueController.getAllIssues);
router.get('/:id', verifyToken, requireRole(['Admin', 'Staff']), issueController.getIssueById);
router.post('/', verifyToken, requireRole(['Admin', 'Staff']), issueController.issueBlood);

module.exports = router;
