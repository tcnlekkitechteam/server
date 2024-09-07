const express = require("express");
const router = express.Router();
const departmentsController = require("../../controllers/departmentsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middlewares/verifyRoles");
const verifyJWT = require("../../middlewares/verifyJWT");

router
  .route("/")
  .get(departmentsController.getDepartments)
  .post(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    departmentsController.createDepartment
  );

router
  .route("/:id")
  .get(departmentsController.getDepartment)
  .post(verifyJWT, departmentsController.joinDepartment)
  .put(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    departmentsController.updateDepartment
  )
  .delete(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin),
    departmentsController.deleteDepartment
  );

module.exports = router;
