const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const verifyRoles = require('../middlewares/verifyRoles');
const ROLES_LIST = require('../config/roles_list');
const verifyJWT = require('../middlewares/verifyJWT');

// Endpoint to post feedback
router.post('/feedback', feedbackController.submitFeedback);

// Endpoint to get all feedbacks (for admin and sub-admin purposes)
router.get('/feedbacks', verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), feedbackController.getAllFeedbacks);

module.exports = router;
