const Department = require('../models/department');
const User = require('../models/user');

exports.createDepartmentTable = async (req, res) => {
    try {
        // Check if the departments table already exists
        const existingDepartment = await Department.findOne({});
        if (existingDepartment) {
            return res.status(400).json({ error: 'Department table already exists' });
        }

        // Create the "departments" table
        await Department.create({});

        res.status(201).json({ message: 'Department table created successfully' });
    } catch (error) {
        console.error('Create Department Table Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.saveUserToDepartment = async (req, res) => {
    try {
        const { _id, department } = req.body;

        // Check if the department exists
        const validDepartments = [
            "w2media", "childrenChurch", "pastoralCareTeam", "trafficControl",
            "ushering", "technicalAndSound", "praiseTeam", "teensChurch",
            "infoDesk", "venueManagement", "medicalTeam", "sundaySchool",
            "camera", "baptismal", "contentAndSocialMedia", "pos"
        ];

        if (!validDepartments.includes(department)) {
            return res.status(400).json({ error: 'Invalid department' });
        }

        // Find the department and user
        let departmentObj = await Department.findOne({});
        // Check if departmentObj is null, if so, create a new department
        if (!departmentObj) {
            departmentObj = await Department.create({});
        }

        const user = await User.findById(_id);

        // Check if the user is already associated with the department
        if (user.department === department) {
            return res.status(400).json({ error: 'User is already associated with this department' });
        }

        // Ensure that the department field exists in departmentObj
        if (!departmentObj[department]) {
            departmentObj[department] = []; // Initialize department field as an array if it doesn't exist
        }

        // Save the user under the selected department
        departmentObj[department].push(_id);
        await departmentObj.save();

        // Associate the user with the department
        user.department = department;
        await user.save();

        res.status(200).json({ message: 'User saved to department successfully' });
    } catch (error) {
        console.error('Save User to Department Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};