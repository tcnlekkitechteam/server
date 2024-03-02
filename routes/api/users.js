const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");

router.route("/join-department").post(usersController.joinDepartment);

module.exports = router;
