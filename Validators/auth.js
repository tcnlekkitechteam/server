const {check} = require('express-validator');

// Custom validator for consent to check if it's a boolean
const isBoolean = value => {
  if (typeof value !== 'boolean') {
      throw new Error('Consent must be a boolean value');
  }
  return true;
};

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
    check('consent')
        .custom(isBoolean)
        .withMessage('Your consent must be a boolean value'),
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

exports.userUpdateValidator = [
    check('name')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Your name is required'),
    check('ageGroup')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Age group is required'),
    check('birthDay')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Your birthday:(dd/mm) is required'),
    check('gender')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Your gender is required'),
    check('phoneNumber')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Your phone number is required'),
    check('maritalStatus')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Your marital status is required'),
    check('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address'),
    check('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ];