const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const connectGroupsController = require("../../controllers/connectGroupsController")


router.route("/join-department").post(usersController.joinDepartment);
router.route("/join-connectGroup").post(connectGroupsController.joinConnectGroup);
router.route("/create-connectGroup").post(connectGroupsController.createConnectGroup);
router.route("/update-connectGroup").post(connectGroupsController.updateConnectGroup);
router.route("/get-connectGroups").get(connectGroupsController.getConnectGroups);
router.route("/get-connectGroup").get(connectGroupsController.getConnectGroup);
router.route("/delete-connectGroup").delete(connectGroupsController.deleteConnectGroup);
router.route("/patch-connectGroup").patch(connectGroupsController.patchConnectGroup);
router.route("/delete-account").delete(usersController.deleteUserAccount);
router.route("/update-user-details/:userId").put(usersController.updateUserAccount);
router.route("/get-user-details/:userId").get(usersController.getUserById);
router.route("/dropdowns").get(usersController.getDropdownOptions);

module.exports = router;
