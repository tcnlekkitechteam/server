const express = require('express');
const router = express.Router();
const UserController = require('../controllers/auth');
const { subscribeNewsletter } = require('../controllers/auth');
const { requireAuth } = require('../controllers/auth');
const EventsController = require('../controllers/eventsController');
// const {getAllUsers} = require('../controllers/auth');
const jwt = require('jsonwebtoken'); // Import jwt library
const postmark = require('postmark');
const User = require('../models/user');
const { getAllUsers, filterUsers } = require('../controllers/auth');
// const moment = require('moment'); // Import moment library

// Create Postmark client
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

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
router.post('/events', EventsController.createEvent);
router.get('/events', EventsController.getAllEvents);
router.get('/events/categories', EventsController.getEventsByCategory);
router.post('/change-password', requireAuth, changePassword);
router.post('/request-new-token', async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(400).json({
                error: 'User with that email does not exist.',
            });
        }

        // Check if the user's account is already verified
        if (user.verified) {
            return res.status(400).json({
                error: 'Your account is already activated.',
            });
        }

        // Generate a new activation token (expires in 24 hours)
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCOUNT_ACTIVATION,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // Send activation email with the new token
        const emailData = {
            From: process.env.EMAIL_FROM,
            To: email,
            Subject: 'New Account Activation Link',
            HtmlBody: `
                <h1>Please use the following link to activate your account within 24 hours.</h1>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
        };

        // Send the email
        await client.sendEmail(emailData);

        return res.json({
            message: `Email has been sent to ${email}. Follow the instructions to activate your account.`,
        });
    } catch (err) {
        console.error('REQUEST NEW TOKEN ERROR', err);
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});
router.get('/user/status', requireAuth, (req, res) => {
    const { userId } = req.user;
    User.findById(userId, (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'User not found' });
        }
        res.json({ verified: user.verified });
    });
});
router.get('/health-check', (req, res) => {
    res.status(200).json({ success: 'API is healthy' });
});


module.exports = router; 