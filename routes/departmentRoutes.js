const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Endpoint to create the "departments" table
router.post('/create', departmentController.createDepartmentTable);

// Endpoint to save a user to a department
router.post('/save-user', departmentController.saveUserToDepartment);

module.exports = router;