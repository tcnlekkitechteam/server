const { check } = require('express-validator');

// Custom validator for consent to check if it's a boolean
const isBoolean = value => {
  if (typeof value !== 'boolean') {
    throw new Error('Consent must be a boolean value');
  }
  return true;
};

const commonRules = [
  check('surName').notEmpty().withMessage('Your surname is required'),
  check('firstName').notEmpty().withMessage('Your firstname is required'),
  check('ageGroup').notEmpty().withMessage('Age group is required'),
  check('birthDay').notEmpty().withMessage('Your birthday:(dd/mm) is required'),
  check('gender').notEmpty().withMessage('Your gender is required'),
  check('phoneNumber').notEmpty().withMessage('Your phone number is required'),
  check('maritalStatus').notEmpty().withMessage('Your marital status is required'),
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.userSignupValidator = [
  ...commonRules,
  check('consent').custom(isBoolean).withMessage('Your consent must be a boolean value'),
];

exports.userSigninValidator = [
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.userUpdateValidator = [
  ...commonRules.map(rule => rule.optional()),
  check('email').optional().isEmail().withMessage('Must be a valid email address'),
  check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
