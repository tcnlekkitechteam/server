const Department = require("../models/DepartmentModel");

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
    if (!req?.body?.name || !req?.body?.description || !req?.body?.imgURL) {
      return res.status(400).json({
        message: "Department name, description and imgURL are required",
      });
    }

    const result = await Department.create({
      name: req.body.name,
      description: req.body.description,
      imgURL: req.body.imgURL,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateDepartment = async (req, res) => {
  try {
    if (!req?.body?.id) {
      return res.status(400).json({ message: "Department ID is required." });
    }

    const department = await Department.findOne({ _id: req.body.id }).exec();
    if (!department) {
      return res
        .status(204)
        .json({ message: `No department matches ID ${req.body.id}.` });
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
};
