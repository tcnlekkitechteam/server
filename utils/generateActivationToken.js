const jwt = require("jsonwebtoken");

const generateActivationToken = (user) => {
  const token = jwt.sign({userId: user._id}, process.env.JWT_ACCOUNT_ACTIVATION, {
    expiresIn: "1d",
  });
  return token;
};

module.exports = { generateActivationToken };
