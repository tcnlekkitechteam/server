const Feedback = require("../models/feedback.model");
const { exportData } = require("../utils/export");
const { Ifilter } = require("../utils/filter");

exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required fields" });
    }

    // const existingFeedback = await Feedback.findOne({ email });

    // if (existingFeedback) {
    //   return res
    //     .status(400)
    //     .json({ error: "Feedback with this email already exists" });
    // }

    const newFeedback = new Feedback({
      name,
      email,
      message,
    });
    await newFeedback.save();

    return res.status(200).json({ message: "Feedback received successfully" });
  } catch (error) {
    console.error("Feedback Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const allowedFields = {
      name: { type: "string" },
      email: { type: "string" },
      message: { type: "string" },
      createdAt: { type: "date", isRange: true, isSingleDate: true },
    };

    const { error, filter, message } = Ifilter(req.query, allowedFields);
    if (error) {
      return res.status(422).json({ message });
    }

    const feedbacks = await Feedback.find(filter);
    res.status(200).json({ feedbacks, totalFeedbacks: feedbacks.length });
  } catch (error) {
    console.error("GET ALL FEEDBACKS ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.exportFeedacks = (req, res) => {
  const headerColumn = [
    { id: "name", title: "Name" },
    { id: "email", title: "Email" },
    { id: "message", title: "Feedback" },
    { id: "createdAt", title: "Created Date" },
  ];

  const allowedFields = {
    name: { type: "string" },
    email: { type: "string" },
    message: { type: "string" },
    createdAt: { type: "date", isRange: true, isSingleDate: true },
  };

  const { error, filter, message } = Ifilter(req.query, allowedFields);
  if (error) {
    return res.status(422).json({ message });
  }

  exportData({
    model: Feedback,
    query: filter,
    headers: headerColumn,
    excludeFields: ["-__v"],
    filePrefix: "feedbacks",
    res,
  });
};
