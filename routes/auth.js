const express = require('express');
const router = express.Router();
const UserController = require('../controllers/auth');
const { subscribeNewsletter } = require('../controllers/auth');
const { requireAuth, joinDepartment } = require('../controllers/auth');
const EventsController = require('../controllers/eventsController');
// const {getAllUsers} = require('../controllers/auth');
const { getAllUsers, filterUsers } = require('../controllers/auth');
// const moment = require('moment'); // Import moment library

// import controller 
const { signup, accountActivation, signin, updateUser, forgotPassword, resetPassword, deleteUser } = require('../controllers/auth');

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
router.post('/events', EventsController.createEvent);
router.get('/events', EventsController.getAllEvents);
router.get('/events/categories', EventsController.getEventsByCategory);
router.post('/joindepartment', requireAuth, joinDepartment);
router.post('/change-password', requireAuth, changePassword);


module.exports = router; 