const express = require("express");
const router = express.Router();
const departmentsController = require("../../controllers/departmentsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middlewares/verifyRoles");

router
  .route("/")
  .get(departmentsController.getDepartments)
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    departmentsController.createDepartment
  )
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    departmentsController.updateDepartment
  )
  .delete(
    verifyRoles(ROLES_LIST.Admin),
    departmentsController.deleteDepartment
  );

router.route("/:id").get(departmentsController.getDepartment);

// New route for joining connectGroups
router
  .route("/:id/joinConnectGroup")
  .post(departmentsController.joinConnectGroup);

module.exports = router;
