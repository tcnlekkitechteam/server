const crypto = require("crypto");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const postmark = require("postmark");
const { sendResetPasswordEmail } = require("../utils/email");
const { getUserAuthPayload } = require("../utils/getUserAuthPayload");

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      birthDay,
      ageGroup,
      occupation,
      gender,
      maritalStatus,
      password,
    } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        error:
          "We are sorry, Email is taken. Kindly signup using another email",
      });
    }

    const token = jwt.sign(
      {
        name,
        email,
        phoneNumber,
        birthDay,
        ageGroup,
        occupation,
        gender,
        maritalStatus,
        password,
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "3600m" }
    );

    const emailData = {
      From: process.env.EMAIL_FROM,
      To: email,
      Subject: "Account Activation Link",
      HtmlBody: `
                <h1>Please use the following link to activate your account.</h1>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
    };

    const sent = await client.sendEmail(emailData);

    return res.json({
      message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
    });
  } catch (err) {
    console.error("SIGNUP ERROR", err);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.accountActivation = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({
        message: "Something went wrong, please try again.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);

    const {
      name,
      email,
      phoneNumber,
      birthDay,
      ageGroup,
      occupation,
      gender,
      maritalStatus,
      password,
    } = jwt.decode(token);

    const user = new User({
      name,
      email,
      phoneNumber,
      birthDay,
      ageGroup,
      occupation,
      gender,
      maritalStatus,
      password,
    });

    const savedUser = await user.save();

    res.json({
      message: "Signup successful. You can sign in now.",
      user: savedUser,
    });
  } catch (error) {
    console.error("Account Activation Error:", error);

    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        error: "Sorry, the link has expired. Kindly signup again",
      });
    } else {
      res.status(401).json({
        error: "Error during account activation. Try signup again.",
      });
    }
  }
};

// Method to signin user
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // To check if user exists
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(400).json({
        error: "User with that email does not exist, please sign up",
      });
    }

    // To authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match",
      });
    }

    // To generate a token and send to user client/user
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: user.name,
          userId: user.userId,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10s",
      }
    );

    const refreshToken = jwt.sign(
      { name: user.name },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Saving refreshToken with current user
    user.refreshToken = refreshToken;
    await user.save();

    // Creates Secure Cookie with refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: getUserAuthPayload(user),
    });
  } catch (err) {
    console.error("SIGNIN ERROR", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

// New function for updating user details
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userDataToUpdate = req.body;

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(userId, userDataToUpdate, {
      new: true,
    });

    // Return the updated user
    return res.json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

// To delete a user
exports.deleteUser = async (req, res) => {
  try {
    // Extract user ID from the request parameters
    const userId = req.params.userId;

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Delete the user
    await User.deleteOne({ _id: userId });

    return res.json({
      message: "User has been deleted successfully",
    });
  } catch (err) {
    console.error("DELETE USER ERROR", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // If the user with the given email doesn't exist
      return res.status(400).json({ error: "User not found with this email" });
    }

    // Generate a reset password token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set the reset token and expiry time in the user object
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour

    // Save the user object with reset token details
    await user.save();

    // Send reset password email
    sendResetPasswordEmail(user.email, resetToken);

    // Return success response
    res.json({ message: "Password reset email sent successfully" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
