const User = require("../models/user");
const Department = require("../models/DepartmentModel");
const { Ifilter } = require("../utils/filter");
const { default: mongoose } = require("mongoose");
const { dropdownOptions } = require("../utils/constant");
const { exportData } = require("../utils/export");
const bcrypt = require("bcrypt");
const generateActivationToken = require("../utils/generateActivationToken");
const { importData } = require("../utils/import");
const { sendActivationEmail } = require("../utils/email");

// const joinConnectGroup = async (req, res) => {
//   const { userID, ConnectGroupID } = req.body;
//   let validConnectGroup = await ConnectGroup.findById(
//     new mongoose.Types.ObjectId(ConnectGroupID)
//   );

//   if (!userID)
//     res.status(400).json({ message: "Invalid or no user id detected!" });

//   if (validConnectGroup) {
//     try {
//       const user = await User.findOneAndUpdate(
//         { _id: userID },
//         {
//           ConnectGroup: {
//             name: validConnectGroup.name,
//             id: validConnectGroup._id,
//           },
//         }
//       );
//       res.status(200).json({
//         message: "Action successfull!",
//       });
//     } catch (e) {
//       res.status(400).json({ err: e });
//     }
//   } else {
//     res.status(404).json({ message: "connectGroup not recognized" });
//   }
// };

// const createConnectGroup = async (req, res) => {
//   try {
//     const { name, description, imgURL } = req.body;

//     // Check if required fields are provided
//     if (!name || !description || !imgURL) {
//       return res.status(400).json({
//         message: "ConnectGroup name, description, and imgURL are required",
//       });
//     }

//     // Create new ConnectGroup
//     const newConnectGroup = await ConnectGroup.create({
//       name,
//       description,
//       imgURL,
//     });

//     res.status(201).json(newConnectGroup);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId);

    const validAccount = await User.findById(userId);
    if (!validAccount) {
      res.send({ message: "User Account not found" }).status(404);
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account Deleted Successfully" });
  } catch (err) {
    res.status(400).json({ err });
  }
};

const updateUserAccount = async (req, res) => {
  try {
    const { userId } = req.params.id;

    const validAccount = await User.findById(userId);
    if (!validAccount) {
      res.send({ message: "User Account not found" }).status(404);
    }

    await User.findByIdAndUpdate(userId, { ...req.body });
    res.status(200).json({ message: "Account Updated Successfully" });
  } catch (err) {
    res.status(503).json({ err });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-hashed_password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const department = await Department.findById(user.department.id);
    // if (!department) {
    //   return res.status(404).json({ message: "Department not found" });
    // }

    const userWithDepartment = {
      ...user.toObject(),
      department: {
        deptName: department?.name ? department?.name : user.department.name,
        id: user?.department?.id || department?._id,
      },
      // residentialArea: user?.residentialArea ?? "",
    };

    console.log(user);

    res.status(200).json(userWithDepartment);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDropdownOptions = (req, res) => {
  res.json(dropdownOptions);
};

const getUsers = async (req, res) => {
  try {
    const allowedFields = {
      email: { type: "string" },
      maritalStatus: { type: "string" },
      industry: { type: "string" },
      gender: { type: "string" },
      ageGroup: { type: "string" },
      department: { type: "string" },
      createdAt: { type: "date", isRange: true, isSingleDate: true },
    };

    const { error, filter, message } = Ifilter(req.query, allowedFields);

    if (error) {
      return res.status(422).json({
        users: [],
        message,
      });
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select(
        "-password -salt -resetPasswordToken -resetPasswordExpires -resetPasswordLink -hashed_password -roles"
      )
      .skip(skip)
      .limit(limit);
    // Exclude sensitive information like password, salt, reset token, etc.

    return res.json({
      page,
      limit,
      totalUsers: await User.countDocuments(filter),
      users,
    });
  } catch (error) {
    console.error("FILTER USERS ERROR", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const getUpcomingBirthdays = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;

    // Birthday - DD/MM
    const parseBirthday = (birthday) => {
      if (!birthday) return { day: null, month: null };
      const [day, month] = birthday.split("/").map(Number);
      return { day, month };
    };

    const isUpcoming = ({ day, month }) => {
      return (
        month > currentMonth || (month === currentMonth && day >= currentDay)
      );
    };

    const users = await User.find();

    const upComingBirthdays = users
      .map((user) => ({
        ...user.toObject(),
        birthDay: parseBirthday(user.birthDay),
      }))
      .filter(
        (user) => user.birthDay.day !== null && isUpcoming(user.birthDay)
      );

    //sorting by month and day for ease of display
    upComingBirthdays.sort((a, b) => {
      const aDate = parseBirthday(a.birthDay);
      const bDate = parseBirthday(b.birthDay);
      return aDate.month - bDate.month || aDate.day - bDate.day;
    });

    res.status(200).json({
      totalUpcomingBirthdays: upComingBirthdays.length,
      users: upComingBirthdays,
    });
  } catch (error) {
    console.error("ERROR GETTING USERS BIRTHDAYS", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-10);
};

const importUsers = (req, res) => {
  const fieldNames = {
    surName: "Surname",
    firstName: "First Name",
    email: "Email",
    phoneNumber: "Phone Number",
    birthDay: "Birth Day",
    ageGroup: "Age Group",
    industry: "Industry",
    department: "Department",
    gender: "Gender",
    maritalStatus: "Marital Status",
    howDidYouHearAboutUs: "How Did You Hear About Us",
    role: "Role",
  };

  importData({
    model: User,
    req,
    fieldMappings: fieldNames,
    preProcessRow: async (row) => {
      const randomPassword = generateRandomPassword();
      row.hashed_password = await bcrypt.hash(randomPassword, 10);
      row.needsPasswordReset = true;
      row.role = row.role || ROLES_LIST.User;
      return row;
    },
    postProcess: async (savedUsers) => {
      for (const user of savedUsers) {
        const activationToken = generateActivationToken(user);
        await sendActivationEmail(user.email, activationToken);
      }
    },
    res,
  });
};

const exportUsers = (req, res) => {
  const allowedFields = {
    email: { type: "string" },
    phoneNumber: { type: "string" },
    industry: { type: "string" },
    ageGroup: { type: "string" },
    department: { type: "string" },
    gender: { type: "string" },
    verified: { type: "boolean" },
    createdAt: { type: "date", isRange: true, isSingleDate: true },
    updatedAt: { type: "date", isRange: true },
  };

  const headerColumn = [
    { id: "surName", title: "Last Name" },
    { id: "firstName", title: "First Name" },
    { id: "email", title: "Email" },
    { id: "phoneNumber", title: "Phone Number" },
    { id: "birthDay", title: "Birth Day" },
    { id: "ageGroup", title: "Age Group" },
    { id: "industry", title: "Industry" },
    { id: "department", title: "Department" },
    { id: "gender", title: "Gender" },
    { id: "maritalStatus", title: "Marital Status" },
    { id: "howDidYouHearAboutUs", title: "How Did You Hear About Us" },
    { id: "residentialArea", title: "Residential Area" },
    { id: "role", title: "Role" },
    { id: "whyDidYouJoinTcnLekki", title: "Why Did You Join TCN Lekki" },
    { id: "createdAt", title: "Registered Date" },
    { id: "updatedAt", title: "Updated Date" },
  ];

  const { error, filter, message } = Ifilter(req.query, allowedFields);
  if (error) {
    return res.status(422).json({
      message,
    });
  }

  exportData({
    model: User,
    query: filter,
    headers: headerColumn,
    excludeFields: [
      "-hashed_password",
      "-salt",
      "-resetPasswordToken",
      "-resetPasswordExpires",
      "-resetPasswordLink",
      "-refreshToken",
    ],
    filePrefix: "registered_users",
    res,
    populateOptions: [{ path: "department", select: "name" }],
  });
};

module.exports = {
  deleteUserAccount,
  updateUserAccount,
  getUserById,
  getDropdownOptions,
  getUsers,
  getUpcomingBirthdays,
  importUsers,
  exportUsers,
};
