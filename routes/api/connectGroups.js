const express = require("express");
const router = express.Router();
const connectGroupsController = require("../../controllers/connectGroupsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middlewares/verifyRoles");

// Route for listing all connect groups and creating a new connect group
router.route("/")
  .get(connectGroupsController.getConnectGroups)
  .post(
    verifyRoles([ROLES_LIST.Admin, ROLES_LIST.Editor]),
    connectGroupsController.createConnectGroup
  );

// Route for specific connect group by ID
router.route("/:id")
  .get(connectGroupsController.getConnectGroup)
  .put(
    verifyRoles([ROLES_LIST.Admin, ROLES_LIST.Editor]),
    connectGroupsController.updateConnectGroup
  )
  .delete(
    verifyRoles([ROLES_LIST.Admin]),
    connectGroupsController.deleteConnectGroup
  );

// Route for joining a connect group by ID
router.route("/:id/join")
  .post(connectGroupsController.joinConnectGroup);

module.exports = router;