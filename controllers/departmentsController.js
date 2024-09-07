const Department = require("../models/DepartmentModel");
const User = require("../models/user")

const joinDepartment = async (req, res) => {
  try {
    const { userId, id } = req.body;

    if (!userId || !id) {
      return res.status(400).json({ message: "userId and departmentId are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: `User with ID ${userId} not found.` });
    }

    const department = await Department.findById(id);
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
    user.department.push(id);
    await user.save();

    return res.status(200).json({ message: "User joined department successfully.", department });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};


const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    if (!departments || departments.length === 0) {
      return res.status(204).json({ message: "No departments found." });
    }
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description, imgURL } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }

    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: "Department with this name already exists" });
    }

    const newDepartment = new Department({
      name,
      description,
      imgURL
    });

    await newDepartment.save();

    return res.status(201).json({ message: "Department created successfully.", department: newDepartment });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: "Internal server error." });
  }
};



const updateDepartment = async (req, res) => {
  try {
    const departmentId  = req.params.id;

    if (!req?.params?.id) {
      return res.status(400).json({ message: "Department ID is required." });
    }

    const department = await Department.findOne({ _id: departmentId }).exec();
    if (!department) {
      return res
        .status(204)
        .json({ message: `No department matches ID ${departmentId}.` });
    }

    if (req.body?.name) department.name = req.body.name;
    if (req.body?.description) department.description = req.body.description;
    
    const result = await department.save();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "Department ID required." });
    }

    const department = await Department.findOne({ _id: req.params.id }).exec();
    if (!department) {
      return res
        .status(204)
        .json({ message: `No department matches ID ${req.params.id}.` });
    }

    const result = await department.deleteOne({ _id: req.params.id });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getDepartment = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "Department ID required." });
    }

    const department = await Department.findOne({ _id: req.params.id }).exec();
    if (!department) {
      return res
        .status(204)
        .json({ message: `No department matches ID ${req.params.id}.` });
    }

    res.json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};



module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
  joinDepartment, 
};