const express = require('express');
const router = express.Router();

// import controller 
const { signup, accountActivation, signin, updateUser, forgotPassword, deleteUser } = require('../controllers/auth');

// import validators
const {userSignupValidator, userSigninValidator, userUpdateValidator,} = require('../Validators/auth');
const {runValidation} = require('../Validators');

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);
router.post('/signin', userSigninValidator, runValidation, signin);
router.put('/update-user/:userId', userUpdateValidator, runValidation, updateUser);
router.delete('/user/:userId', deleteUser);
router.post('/forgot-password', forgotPassword);

module.exports = router; 