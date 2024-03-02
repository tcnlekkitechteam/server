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

module.exports = {
  joinDepartment,
};
