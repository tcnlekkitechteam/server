const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { getUserAuthPayload } = require("../utils/getUserAuthPayload");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);
  const refreshToken = cookies.refreshToken;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden

  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.email !== decoded.email) return res.sendStatus(403);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.name,
          userId: foundUser.userId,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
    );

    res.json({ user: getUserAuthPayload(foundUser), accessToken });
  });
};

module.exports = { handleRefreshToken };
