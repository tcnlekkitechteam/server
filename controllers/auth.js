const crypto = require("crypto");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const postmark = require("postmark");
const Newsletter = require("../models/newsletter");
// const moment = require('moment'); // Import moment library
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
      industry,
      department,
      gender,
      maritalStatus,
      password,
      consent,
    } = req.body;

    // Validate the birthDay format (DD-MM-YYYY)
    // if (!moment(birthDay, 'DD-MM-YYYY', true).isValid()) {
    //     return res.status(400).json({
    //         error: 'Invalid birthDay format. Please use the format DD-MM-YYYY.',
    //     });
    // }

    // // Calculate age based on birthDay
    // const currentDate = new Date();
    // const userBirthDay = moment(birthDay, 'DD-MM-YYYY').toDate();
    // const age = currentDate.getFullYear() - userBirthDay.getFullYear();

    // // Check if the calculated age is less than 18
    // if (age < 18) {
    //     return res.status(400).json({
    //         error: 'You must be 18 years or older to sign up.',
    //     });
    // }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        error:
          "We are sorry, Email is taken. Kindly sign up using another email.",
      });
    }

    // To check if the user provided consent
    if (!consent) {
      return res.status(400).json({
        error: "Consent is required to sign up.",
      });
    }

    const token = jwt.sign(
      {
        name,
        email,
        phoneNumber,
        birthDay,
        ageGroup,
        industry,
        department,
        gender,
        maritalStatus,
        password,
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "3600m" }
    );

    // To send email
    const emailData = {
      From: process.env.EMAIL_FROM,
      To: email,
      Subject: "Account Activation Link",
      HtmlBody: `
                <h1>Please use the following link to activate your account.</h1>
                <p>${process.env.CLIENT_URL}/activate-account?token=${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
    };

    const sent = await client.sendEmail(emailData);

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
      industry,
      department,
      gender,
      maritalStatus,
      password,
      consent,
    } = jwt.decode(token);

    const user = new User({
      name,
      email,
      phoneNumber,
      birthDay,
      ageGroup,
      industry,
      department,
      gender,
      maritalStatus,
      password,
      consent,
    });

    const savedUser = await user.save();

    res.status(201).json({
      message: "Signup successful. You can sign in now.",
      // user: savedUser,
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
// exports.signin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // To check if user exists
//     const user = await User.findOne({ email }).exec();

//     if (!user) {
//       return res.status(400).json({
//         error: "User with that email does not exist, please sign up",
//       });
//     }

//     // To authenticate
//     if (!user.authenticate(password)) {
//       return res.status(400).json({
//         error: "Email and password do not match",
//       });
//     }

//     // To generate a token and send to user client/user
//     const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     const {
//       userId,
//       name,
//       phoneNumber,
//       birthDay,
//       ageGroup,
//       industry,
//       gender,
//       maritalStatus,
//       role,
//     } = user;

//     return res.json({
//       token,
//       user: {
//         userId,
//         name,
//         email,
//         phoneNumber,
//         birthDay,
//         ageGroup,
//         industry,
//         gender,
//         maritalStatus,
//         role,
//       },
//     });
//   } catch (err) {
//     console.error("SIGNIN ERROR", err);
//     res.status(500).json({
//       error: "Internal Server Error",
//     });
//   }
// };

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

    // Set new password and reset token details
    user.password = newPassword;
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
    const { maritalStatus, industry, gender, ageGroup, department } = req.query;
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

// // To delete a user
// exports.deleteUser = async (req, res) => {
//     try {
//         // Extract user ID from the request parameters
//         const userId = req.params.userId;

//         // Check if the user exists
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 error: 'User not found'
//             });
//         }

//         // Delete the user
//         await User.deleteOne({_id: userId});

//         return res.json({
//             message: 'User has been deleted successfully'
//         });
//     } catch (err) {
//         console.error('DELETE USER ERROR', err);
//         res.status(500).json({
//             error: 'Internal Server Error'
//         });
//     }
// };
