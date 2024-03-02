const Department = require("../models/DepartmentModel");

const getDepartments = async (req, res) => {
  const departments = await Department.find();
  if (!departments)
    return res.status(204).json({ message: "No department found." });
  res.json(departments);
};

const createDepartment = async (req, res) => {
  if (!req?.body?.name || !req?.body?.description || !req?.body?.imgURL) {
    return res
      .status(400)
      .json({
        message: "Department name, description and imgURL are required",
      });
  }

  try {
    const result = await Department.create({
      name: req.body.name,
      description: req.body.description,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

const updateDepartment = async (req, res) => {
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
};

const deleteDepartment = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Department ID required." });

  const department = await Department.findOne({ _id: req.params.id }).exec();
  if (!department) {
    return res
      .status(204)
      .json({ message: `No department matches ID ${req.params.id}.` });
  }
  const result = await department.deleteOne({ _id: req.params.id });
  res.json(result);
};

const getDepartment = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Department ID required." });

  const department = await Department.findOne({ _id: req.params.id }).exec();
  if (!department) {
    return res
      .status(204)
      .json({ message: `No department matches ID ${req.params.id}.` });
  }
  res.json(department);
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
};
