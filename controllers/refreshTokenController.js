const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { getUserAuthPayload } = require("../utils/getUserAuthPayload");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);
  const refreshToken = cookies.refreshToken;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.email !== decoded.email) return res.sendStatus(403);

    // Generate a new access token
    const accessToken = jwt.sign(
      { userId: foundUser._id, email: foundUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
    );

    // Return the user details and access token
    return res.json({
      accessToken,
      user: {
        _id: foundUser._id,
        surName: foundUser.surName,
        firstName: foundUser.firstName,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        birthDay: foundUser.birthDay,
        ageGroup: foundUser.ageGroup,
        industry: foundUser.industry,
        areas: foundUser.areas,
        department: foundUser.department,
        connectGroup:foundUser.connectGroup,
        gender: foundUser.gender,
        maritalStatus: foundUser.maritalStatus,
        role: foundUser.role,
        verified: foundUser.verified,
      },
    });
  });
};

module.exports = { handleRefreshToken };

