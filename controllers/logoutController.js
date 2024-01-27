const User = require("../models/user");

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204); //No content
  const refreshToken = cookies.refreshToken;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  foundUser.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.sendStatus(204);
};

module.exports = { handleLogout };
