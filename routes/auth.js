const express = require('express');
const router = express.Router();
const UserController = require('../controllers/auth');
const { subscribeNewsletter } = require('../controllers/auth');
const { requireAuth } = require('../controllers/auth');
// const {getAllUsers} = require('../controllers/auth');
const { getAllUsers, filterUsers } = require('../controllers/auth');
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES_LIST = require("../config/roles_list");
// const moment = require('moment'); // Import moment library

// import controller 
const { signup, accountActivation, signin, updateUser, forgotPassword, resetPassword, deleteUser, changePassword } = require('../controllers/auth');

// import validators
const {userSignupValidator, userSigninValidator, userUpdateValidator,} = require('../Validators/auth');
const {runValidation} = require('../Validators');

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);
router.post('/signin', userSigninValidator, runValidation, signin);
router.put('/update-user/:userId', userUpdateValidator, runValidation, updateUser);
// router.delete('/user/:userId', deleteUser);
router.delete('/user/:userEmail', deleteUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', getAllUsers);
router.get('/users/filter', filterUsers);
router.get('/users/count', UserController.countUsers);
router.post('/subscribe-newsletter', subscribeNewsletter);
router.post('/change-password', requireAuth, changePassword);
router.get('/health-check', (req, res) => {
    res.status(200).json({ success: 'API is healthy' });
});


module.exports = router; 