const {check} = require('express-validator');

exports.userSignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Your name is required'),
    check('ageGroup')
        .not()
        .isEmpty()
        .withMessage('Age group is required'),
    check('birthDay')
        .not()
        .isEmpty()
        .withMessage('Your birthday:(dd/mm) is required'),
    check('gender')
        .not()
        .isEmpty()
        .withMessage('Your gender is required'),
    check('phoneNumber')
        .not()
        .isEmpty()
        .withMessage('Your phone number is required'),
    check('maritalStatus')
        .not()
        .isEmpty()
        .withMessage('Your marital status is required'),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({min: 6})
        .withMessage('We are sorry but your Password must be at least 6 character'),
];

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
   
    check('password')
        .isLength({min: 6})
        .withMessage('We are sorry but your Password must be at least 6 character'),
];