const ConnectGroup = require("../models/ConnectGroupModel");
const User = require("../models/user");
const { isValidObjectId } = require('mongoose');

const joinConnectGroup = async (req, res) => {
    try {
      const { _id: userId, name } = req.body;
  
      if (!userId || !name) {
        return res.status(400).json({ message: "userId and name are required" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found.` });
      }
  
      let connectGroup = await ConnectGroup.findOne({ name });
      if (!connectGroup) {
        connectGroup = await ConnectGroup.create({
          name,
          connectGroups: [userId],
        });
      } else {
        if (connectGroup.connectGroups.includes(userId)) {
          return res.status(400).json({ message: "User is already in the ConnectGroup." });
        } else {
          connectGroup.connectGroups.push(userId);
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

    if (!name || !description || !imgURL) {
      return res.status(400).json({ message: "ConnectGroup name, description, and imgURL are required" });
    }

    const existingConnectGroup = await ConnectGroup.findOne({ name });
    if (existingConnectGroup) {
      return res.status(400).json({ message: "ConnectGroup with this name already exists." });
    }

    const newConnectGroup = await ConnectGroup.create({ name, description, imgURL });
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

    const connectGroup = await ConnectGroup.findById(id);
    if (!connectGroup) {
      return res.status(404).json({ message: `ConnectGroup with ID ${id} not found.` });
    }

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
      return res.status(204).json({ message: `No connectgroup matches ID ${req.params.id}.` });
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
      return res.status(204).json({ message: `No connectGroup matches ID ${req.params.id}.` });
    }

    res.json(connectGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// PATCH endpoint
const patchConnectGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "ConnectGroup ID is required." });
    }

    const connectGroup = await ConnectGroup.findById(id);
    if (!connectGroup) {
      return res.status(404).json({ message: `ConnectGroup with ID ${id} not found.` });
    }

    for (const key in updates) {
      connectGroup[key] = updates[key];
    }

    const updatedConnectGroup = await connectGroup.save();
    res.json(updatedConnectGroup);
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
  patchConnectGroup
};
