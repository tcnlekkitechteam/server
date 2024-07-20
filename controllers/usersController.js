const User = require("../models/user");
const Department = require("../models/DepartmentModel");
const ConnectGroup = require("../models/ConnectGroupModel")
const { default: mongoose } = require("mongoose");
const { dropdownOptions } = require("../utils/constant");

const joinDepartment = async (req, res) => {
  try {
    const { userId, departmentId } = req.body;

    if (!userId || !departmentId) {
      return res.status(400).json({ message: "userId and departmentId are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: `User with ID ${userId} not found.` });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department does not exist.", department: [] });
    }

    if (department.users && department.users.includes(userId)) {
      return res.status(400).json({ message: "User is already a member of this department." });
    }

    // Add user to the department's user list
    department.users.push(userId);
    await department.save();

    // Add department to the user's department list
    user.departments.push(departmentId);
    await user.save();

    return res.status(200).json({ message: "User joined department successfully.", department });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { joinDepartment };


const joinConnectGroup = async (req, res) => {
  const { userID, ConnectGroupID } = req.body;
  let validConnectGroup = await ConnectGroup.findById(
    new mongoose.Types.ObjectId(ConnectGroupID)
  );

  if (!userID)
    res.status(400).json({ message: "Invalid or no user id detected!" });

  if (validConnectGroup) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: userID },
        {
          ConnectGroup: {
            name: validConnectGroup.name,
            id: validConnectGroup._id,
          },
        }
      );
      res.status(200).json({
        message: "Action successfull!",
      });
    } catch (e) {
      res.status(400).json({ err: e });
    }
  } else {
    res.status(404).json({ message: "connectGroup not recognized" });
  }
};

const createConnectGroup = async (req, res) => {
  try {
    const { name, description, imgURL } = req.body;

    // Check if required fields are provided
    if (!name || !description || !imgURL) {
      return res.status(400).json({
        message: "ConnectGroup name, description, and imgURL are required",
      });
    }

    // Create new ConnectGroup
    const newConnectGroup = await ConnectGroup.create({
      name,
      description,
      imgURL,
    });

    res.status(201).json(newConnectGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId)

    const validAccount = await User.findById(userId);
    if (!validAccount) {
      res.send({ message: "User Account not found" }).status(404);
    }

    await User.findByIdAndDelete(userId);
    res.send({ message: "Account Deleted Successfully" }).status(200);
  } catch (err) {
    res.status(400).json({ err});
  }
};

const updateUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const validAccount = await User.findById(userId);
    if (!validAccount) {
      res.send({ message: "User Account not found" }).status(404);
    }

    await User.findByIdAndUpdate(userId, { ...req.body });
    res.send({ message: "Account Updated Successfully" }).status(200);
  } catch (err) {
    res.status(503).json({ err });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
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
        deptName: department?.name ?  department?.name : null,
        id: user?.department?.id || department?._id
      },
      residentialArea: user?.residentialArea ?? ''
    };

    res.status(200).json(userWithDepartment);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  const getDropdownOptions = (req, res) => {
    res.json(dropdownOptions);
  };

module.exports = {
  joinDepartment,
  joinConnectGroup,
  createConnectGroup,
  deleteUserAccount,
  updateUserAccount,
  getUserById,
  getDropdownOptions
};
