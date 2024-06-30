const ConnectGroup = require("../models/ConnectGroupModel");
const User = require("../models/user")
const { isValidObjectId } = require('mongoose');


const joinConnectGroup = async (req, res) => {
    try {
      const { _id: userId, name } = req.body; //To Extract userId (represented as _id) and connectGroupName from req.body
  
      // Check if required fields are provided
      if (!userId || !name) {
        return res.status(400).json({
          message: "userId and name are required",
        });
      }
  
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found.` });
      }
  
      // Check if the ConnectGroup exists by name
      let connectGroup = await ConnectGroup.findOne({ name });
      if (!connectGroup) {
        // If the ConnectGroup doesn't exist, create it
        connectGroup = await ConnectGroup.create({
          name,
          connectGroups: [userId], // Initialize connectGroups array with userId
        });
      } else {
        // Check if the user is already in the ConnectGroup
        if (connectGroup.connectGroup.includes(userId)) {
          return res.status(400).json({ message: "User is already in the ConnectGroup." });
        }
          else { 
        // Add user to the ConnectGroup
        connectGroup.connectGroup.push(userId);
        await connectGroup.save();
          }
      }
  
      res.status(200).json({ message: "User joined ConnectGroup successfully.", connectGroup });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
  
  

const getConnectGroups = async (req, res) => {
  try {
    const connectGroups = await ConnectGroup.find();
    if (!connectGroups || connectGroups.length === 0) {
      return res.status(204).json({ message: "No connectGroup found." });
    }
    res.json(connectGroups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
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
  
      // Check if a ConnectGroup with the same name already exists
      const existingConnectGroup = await ConnectGroup.findOne({ name });
      if (existingConnectGroup) {
        return res.status(400).json({ message: "ConnectGroup with this name already exists." });
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
  
  

  const updateConnectGroup = async (req, res) => {
    try {
      const { id, name, description } = req.body;
  
      if (!id) {
        return res.status(400).json({ message: "ConnectGroup ID is required." });
      }
  
      // Check if the ConnectGroup exists
      const connectGroup = await ConnectGroup.findById(id);
      if (!connectGroup) {
        return res.status(404).json({ message: `ConnectGroup with ID ${id} not found.` });
      }
  
      // Update ConnectGroup fields if provided
      if (name) connectGroup.name = name;
      if (description) connectGroup.description = description;
  
      const updatedConnectGroup = await connectGroup.save();
      res.json(updatedConnectGroup);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  

const deleteConnectGroup = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "Connectgroup ID required." });
    }

    const connectGroup = await ConnectGroup.findOne({ _id: req.params.id }).exec();
    if (!connectGroup) {
      return res
        .status(204)
        .json({ message: `No connectgroup matches ID ${req.params.id}.` });
    }

    const result = await connectGroup.deleteOne({ _id: req.params.id });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getConnectGroup = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "ConnectGroup ID required." });
    }

    const connectGroup = await ConnectGroup.findOne({ _id: req.params.id }).exec();
    if (!connectGroup) {
      return res
        .status(204)
        .json({ message: `No connectGroup matches ID ${req.params.id}.` });
    }

    res.json(connectGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
    getConnectGroups,
    createConnectGroup,
    updateConnectGroup,
    deleteConnectGroup,
    getConnectGroup,
    joinConnectGroup,
  };