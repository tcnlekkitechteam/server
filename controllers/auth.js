const crypto = require("crypto");
const User = require("../models/user");
const Department = require("../models/DepartmentModel");
const jwt = require("jsonwebtoken");
const postmark = require("postmark");
const bcrypt = require("bcrypt");
const Newsletter = require("../models/newsletter");
// const moment = require('moment'); // Import moment library
const { sendResetPasswordEmail } = require("../utils/email");
const { getUserAuthPayload } = require("../utils/getUserAuthPayload");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

exports.signup = async (req, res) => {
  try {
    const {
      surName,
      firstName,
      email,
      phoneNumber,
      birthDay,
      ageGroup,
      industry,
      areas,
      gender,
      maritalStatus,
      noOfChildren,
      whyDidYouJoinTcnLekki,
      password,
      department,
      consentToReceiveUpdates,
      consent,
    } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email is already taken. Please sign up with a different email.",
      });
    }

    // Validate department if provided
    let validDepartment;
    if (department) {
      validDepartment = await Department.findById(department);
      if (!validDepartment) {
        return res.status(400).json({
          error: "Department not recognized.",
        });
      }
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const user = new User({
      surName,
      firstName,
      email,
      phoneNumber,
      birthDay,
      ageGroup,
      industry,
      areas,
      gender,
      maritalStatus,
      noOfChildren,
      whyDidYouJoinTcnLekki,
      hashed_password,
      consentToReceiveUpdates,
      consent,
    });

    if (validDepartment) {
      user.department = {
        name: validDepartment.name,
        id: validDepartment._id,
      };
    }

    // Save the user directly without email verification
    await user.save();

    // Generate token for account activation (expires in 1 day)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Send activation email
    const emailData = {
      From: process.env.EMAIL_FROM,
      To: email,
      Subject: "Account Activation Link",
      HtmlBody: `
              <h1>Welcome to the TCN Lekki Information Portal</h1>
              <p>Hi ${user.firstName},<br>I am pleased to welcome you to the TCN Lekki Information Portal. It's a platform we have carefully designed to enhance your experience as a member of the Lekki campus of The Covenant Nation.
              Kindly click on the link below to activate your account and complete your sign up process within 24 hours.<br>
              ${process.env.CLIENT_URL}/activate-account?token=${token} <br>
              Joining the TCN Lekki information Platform will give you access to regular updates and draw you into
              an immersive church-life experience that will provide support for your spiritual growth.
              I encourage you to take advantage of this platform by filling your correct information, verifying your
              email where applicable and visiting this portal regularly to connect with the church community. We also
               look forward to feedback on how we can improve church life at TCN Lekki.<br> Once again, welcome aboard.<br>
               Grace is multiplied in your favor!<br>
               Best regards,<br>
               Pastor Tayo Osiyemi </p>
              
              <hr/>
              <p>This email may contain sensitive information</p>
              <p>${process.env.CLIENT_URL}</p>
          `,
    };

    await client.sendEmail(emailData);

    return res.json({
      message: `Email has been sent to ${email}. Follow the instructions to activate your account.`,
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
      return res.status(400).json({
        error: "Token is required for account activation",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);
    const { userId } = decoded;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        error: "Account already activated",
      });
    }

    // Set user's verified status to true
    user.verified = true;
    await user.save();

    return res.status(201).json({
      message: "Account activated successfully. You can sign in now.",
    });
  } catch (error) {
    console.error("Account Activation Error:", error);

    // Handle token expiration error separately
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Sorry, the activation link has expired. Please sign up again.",
      });
    }

    // Handle other errors during activation
    return res.status(401).json({
      error:
        "Error during account activation. Please try again or sign up again.",
    });
  }
};


// Function to delete unactivated users after 7 days
const deleteUnactivatedUsers = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Find unactivated users created more than 7 days ago
  const unactivatedUsers = await User.find({
    verified: false,
    createdAt: { $lte: sevenDaysAgo },
  });

  // Delete unactivated users
  for (const user of unactivatedUsers) {
    await user.remove();
    console.log(`Deleted unactivated user with email: ${user.email}`);
  }
};

// Call the function periodically, for example, every day
setInterval(deleteUnactivatedUsers, 24 * 60 * 60 * 1000); // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

// Method to signin user
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(400).json({
        error: "User with that email does not exist, please sign up",
      });
    }

    // Check if the provided password matches the hashed password stored for the user
    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashed_password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Email and password do not match",
      });
    }

    // Generate a token for the authenticated user
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Generate a refresh token for the authenticated user
    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Save the refresh token to the user document
    user.refreshToken = refreshToken;
    await user.save();

    // Create a secure HTTP-only cookie with the refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Ensures the cookie is only sent over HTTPS
      sameSite: "None", // Allows cross-site requests
      maxAge: 24 * 60 * 60 * 1000, // Expires in 1 day
    });

    // Destructure user details for response
    const {
      _id,
      surName,
      firstName,
      phoneNumber,
      birthDay,
      ageGroup,
      industry,
      areas,
      department,
      gender,
      maritalStatus,
      noOfChildren,
      whyDidYouJoinTcnLekki,
      role,
      roles,
    } = user;

    // To return token, user details, and verification status in response
    return res.json({
      accessToken,
      roles: Object.values(roles).filter(Boolean),
      // refreshToken, // Sending the refresh token alongside the access token
      user: {
        _id,
        surName,
        firstName,
        email,
        phoneNumber,
        birthDay,
        ageGroup,
        industry,
        areas,
        department,
        gender,
        maritalStatus,
        noOfChildren,
        whyDidYouJoinTcnLekki,
        role,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("SIGNIN ERROR", err);
    return res.status(500).json({
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

// Function for resetting user password using the reset token
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by reset password token and check expiry time
    const user = await User.findOne({
      resetPasswordToken: crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex"),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash the password
    const hashed_password = await bcrypt.hash(newPassword, 10);

    // Set new password and reset token details
    user.password = newPassword;
    user.hashed_password = hashed_password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user object
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Extract user email from the request parameters
    const userEmail = req.params.userEmail;

    // Check if the user exists
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Delete the user
    await User.deleteOne({ email: userEmail });

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

// Function to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "-password -salt -resetPasswordToken -resetPasswordExpires -resetPasswordLink -hashed_password"
    );
    // Excludes sensitive information like password, salt, reset token, etc.

    return res.json({
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.countUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    return res.json({
      count: userCount,
    });
  } catch (error) {
    console.error("COUNT USERS ERROR", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

// Function to filter users
exports.filterUsers = async (req, res) => {
  try {
    const { maritalStatus, industry, gender, ageGroup, department, areas } = req.query;
    const filter = {};

    // Add filters if they are provided
    if (maritalStatus) {
      filter.maritalStatus = maritalStatus;
    }

    if (industry) {
      filter.industry = industry;
    }

    if (department) {
      filter.department = department;
    }

    if (gender) {
      filter.gender = gender;
    }

    if (ageGroup) {
      filter.ageGroup = ageGroup;
    }
    
    if (areas) {
      filter.areas = areas;
    }
    const users = await User.find(
      filter,
      "-password -salt -resetPasswordToken -resetPasswordExpires -resetPasswordLink -hashed_password"
    );
    // Exclude sensitive information like password, salt, reset token, etc.

    return res.json({
      users,
    });
  } catch (error) {
    console.error("FILTER USERS ERROR", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email is already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      return res
        .status(400)
        .json({ error: "Email is already subscribed to the newsletter" });
    }

    // Create a new subscriber document
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res
      .status(200)
      .json({ message: "Successfully subscribed to the newsletter" });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Authorization token not provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);

    // Change the password
    await user.changePassword(currentPassword, newPassword);

    // Send success response
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(400).json({ error: error.message });
  }
};