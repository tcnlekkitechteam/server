const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const departmentsController = require("../../controllers/departmentsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");
const { userUpdateValidator,} = require('../../Validators/auth');
const {runValidation} = require("../../Validators");
const upload = require("../../middlewares/upload");

// router.route("/join-department").post(verifyJWT, usersController.joinDepartment);
// router.route("/create-department").post(verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), departmentsController.createDepartment);
// router.route("/get-departments").get(departmentsController.getDepartments);
// router.route("/get-department").get(departmentsController.getDepartment);
router.delete("/delete-account", verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), usersController.deleteUserAccount);
// router.get("/get-user-details/:userId", verifyJWT, usersController.getUserById);
router.get('/export', verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), usersController.exportUsers);
router.get('/import', verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), upload.single('file'), usersController.importUsers);
router.get('/upcoming-birthdays', verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), usersController.getUpcomingBirthdays);
router.get("/:userId", verifyJWT, usersController.getUserById)
router.get("/dropdowns", usersController.getDropdownOptions);
router.put('/:userId', verifyJWT, userUpdateValidator, runValidation, usersController.updateUserAccount);
// router.delete('/user/:userId', verifyJWT, usersController.deleteUserAccount);
router.get('/', verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), usersController.getUsers);




module.exports = router;
