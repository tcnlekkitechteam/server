const express = require("express");
const router = express.Router();
const connectGroupsController = require("../../controllers/connectGroupsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middlewares/verifyRoles");
const verifyJWT = require("../../middlewares/verifyJWT");

// Route for listing all connect groups and creating a new connect group
router.route("/")
  .get(connectGroupsController.getConnectGroups)
  .post(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    connectGroupsController.createConnectGroup
  );

// Route for specific connect group by ID
router.route("/:id")
  .get(
    verifyJWT, 
    connectGroupsController.getConnectGroup)
  .put(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    connectGroupsController.updateConnectGroup
  )
  .delete(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin),
    connectGroupsController.deleteConnectGroup
  );

// Route for joining a connect group by ID
router.route("/:id/join")
  .post(
    verifyJWT, 
    connectGroupsController.joinConnectGroup);

  router.route("/:id")
  .patch(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    connectGroupsController.patchConnectGroup);

module.exports = router;