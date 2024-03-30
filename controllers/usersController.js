const User = require("../models/user");
const Department = require("../models/DepartmentModel");
const { default: mongoose } = require("mongoose");

const joinDepartment = async (req, res) => {
  const { userID, departmentID } = req.body;
  let validDepartment = await Department.findById(
    new mongoose.Types.ObjectId(departmentID)
  );

  if (!userID)
    res.status(400).json({ message: "Invalid or no user id detected!" });

  if (validDepartment) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: userID },
        {
          department: {
            name: validDepartment.name,
            id: validDepartment._id,
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
    res.status(404).json({ message: "Department not recognized" });
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
        id: user?.department?.id
      }
    };

    res.status(200).json(userWithDepartment);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  joinDepartment,
  deleteUserAccount,
  updateUserAccount,
  getUserById
};
