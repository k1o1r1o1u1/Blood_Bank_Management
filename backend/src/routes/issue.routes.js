const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');

router.get('/', issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);
router.post('/', issueController.issueBlood);

module.exports = router;
