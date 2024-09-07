const PrayerRequest = require("../models/prayerRequest.model");
const { exportData } = require("../utils/export");
const { Ifilter } = require("../utils/filter");

exports.submitPrayerRequst = async (req, res) => {
  try {
    const { name, request } = req.body;

    // Validation: Ensure required fields are provided
    if (!request) {
      return res.status(400).json({
        error: "Request is a required field",
      });
    }

    // Check if user has already submitted a prayer request in the last 24 hours
    const yesterday = moment().subtract(1, "days");
    const existingRequest = await PrayerRequest.findOne({
      name: name || "Anonymous",
      createdAt: { $gte: yesterday.toDate() },
    });

    if (existingRequest) {
      return res.status(400).json({
        error: `${
          name || "Anonymous"
        }, you have already submitted a prayer request today. Please try again tomorrow.`,
      });
    }

    // Save prayer request to MongoDB
    const newPrayerRequest = new PrayerRequest({
      name: name || "Anonymous",
      request,
    });
    await newPrayerRequest.save();

    // Send a response
    return res
      .status(201)
      .json({
        message: `${
          name || "Anonymous"
        }, your prayer request was submitted successfully`,
      });
  } catch (error) {
    console.error("Prayer Request Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllPrayerRequests = async (req, res) => {
  try {
    const allowedFields = {
      name: { type: "string" },
      request: { type: "string" },
      createdAt: { type: "date", isRange: true, isSingleDate: true },
    };

    const { error, filter, message } = Ifilter(req.query, allowedFields);
    if (error) {
      return res.status(422).json({ message });
    }

    const prayerRequests = await PrayerRequest.find(filter);
    res.status(200).json({ prayerRequests, count: prayerRequests.length });
  } catch (error) {
    console.error("GET ALL PRAYER-REQUESTS ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.exportPrayerRequests = (req, res) => {
  const headerColumn = [
    { id: "name", title: "Name" },
    { id: "reqest", title: "Prayer Request" },
    { id: "createdAt", title: "Created Date" },
  ];

  const allowedFields = {
    name: { type: "string" },
    request: { type: "string" },
    createdAt: { type: "date", isRange: true, isSingleDate: true },
  };

  const { error, filter, message } = Ifilter(req.query, allowedFields);
  if (error) {
    return res.status(422).json({ message });
  }

  exportData({
    model: PrayerRequest,
    query: filter,
    headers: headerColumn,
    excludeFields: ["-__v"],
    filePrefix: "prayer-requests",
    res,
  });
};
