const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");

router.route("/join-department").post(usersController.joinDepartment);
router.route("/delete-account").delete(usersController.deleteUserAccount);
router.route("/update-user-details/:userId").put(usersController.updateUserAccount);
router.route("/get-user-details/:userId").get(usersController.getUserById);
router.route("/dropdowns").get(usersController.getDropdownOptions);


module.exports = router;
