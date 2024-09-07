const express = require('express');
const router = express.Router();
const feedbackController = require('./../../controllers/feedbackController');
const verifyRoles = require('../../middlewares/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const verifyJWT = require('../../middlewares/verifyJWT');

router.post('/feedback', feedbackController.submitFeedback);

router.get('/feedbacks', verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), feedbackController.getAllFeedbacks);

router.get('/feedbacks/export', verifyJWT, verifyRoles(ROLES_LIST.Admin), feedbackController.exportFeedacks )

module.exports = router;
