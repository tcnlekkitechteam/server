const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/auth');
const jwt = require('jsonwebtoken'); 
const postmark = require('postmark');
const User = require('../models/user');
const verifyJWT = require('../middlewares/verifyJWT');
const ROLES_LIST = require('../config/roles_list')
const verifyRoles = require('../middlewares/verifyRoles');

// Create Postmark client
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

// import controller 
const EventsController = require('../controllers/eventsController');
const UserController = require('../controllers/auth');

// import validators
const {userSignupValidator, userSigninValidator, userUpdateValidator,} = require('../Validators/auth');
const {runValidation} = require('../Validators');

router.post('/signup', userSignupValidator, runValidation, UserController.signup);
router.post('/account-activation', UserController.accountActivation);
router.post('/signin', userSigninValidator, runValidation, UserController.signin);
router.put('/update-user/:userId', userUpdateValidator, runValidation, verifyJWT, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User), UserController.updateUser);
// router.delete('/user/:userId', deleteUser);
router.delete('/user/:userEmail', verifyJWT, verifyRoles(ROLES_LIST.Admin), UserController.deleteUser);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.get('/users', verifyJWT, verifyRoles(ROLES_LIST.Admin), UserController.getAllUsers);
router.get('/users/filter', verifyJWT, verifyRoles(ROLES_LIST.Admin), UserController.filterUsers);
// router.get('/users/count', UserController.countUsers);
router.post('/subscribe-newsletter', UserController.subscribeNewsletter);
router.post('/events', verifyJWT, verifyRoles(ROLES_LIST.Admin), EventsController.createEvent);
router.get('/events',  EventsController.getAllEvents);
router.get('/events/categories', EventsController.getEventsByCategory);
router.post('/change-password', verifyJWT, UserController.changePassword);
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