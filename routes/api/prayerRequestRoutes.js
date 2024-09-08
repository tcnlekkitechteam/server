const express = require('express');
const router = express.Router();
const prayerRequestController = require('../../controllers/prayerRequestController');
const verifyRoles = require('../../middlewares/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const verifyJWT = require('../../middlewares/verifyJWT');

router.post('/prayer-request', prayerRequestController.submitPrayerRequst);

router.get('/prayer-requests', verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), prayerRequestController.getAllPrayerRequests);

router.get('/prayer-requests/export', verifyJWT, verifyRoles(ROLES_LIST.Admin), prayerRequestController.exportPrayerRequests )

module.exports = router;
