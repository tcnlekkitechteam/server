require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const departmentRoutes = require("./routes/api/departments.js");
const connectGroupRoutes = require("./routes/api/connectGroups.js");
const usersRoutes = require("./routes/api/users.js");
const eventRoutes = require("./routes/api/eventRouter")
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const Feedback = require("./models/feedback.model.js");
const PrayerRequest = require("./models/prayerRequest.model.js"); // Import the PrayerRequest model
const moment = require("moment");
const app = express();
const port = process.env.PORT || 8000;

// import routes
const authRoutes = require("./routes/auth");
const connectDB = require("./config/dbConn");
const credentials = require("./middlewares/credentials");

// To connect to database
connectDB();

// app middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// Routes
app.use("/api", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/connectGroups", connectGroupRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/refresh", require("./routes/refresh"));
app.use("/api/logout", require("./routes/logout"));
// app.use('/api', departmentRoutes);

// Feedback endpoint
app.post("/feedback", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation: Ensure required fields are provided
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required fields" });
    }

    // Check if a feedback with the given email already exists
    const existingFeedback = await Feedback.findOne({ email });

    if (existingFeedback) {
      return res
        .status(400)
        .json({ error: "Feedback with this email already exists" });
    }

    // Save feedback to MongoDB
    const newFeedback = new Feedback({
      name,
      email,
      message,
    });
    await newFeedback.save();

    // Send a response
    return res.status(200).json({ message: "Feedback received successfully" });
  } catch (error) {
    console.error("Feedback Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health check route
app.get("/health-check", async (req, res) => {
  return res.status(200).json({
    success: "Success",
  });
});

// Route to return a link
app.get("/get-coreTeam-link", (req, res) => {
  const link = 'https://tcnlekki.com/coreTeam'; // Replace with actual link
  res.json({ link });
});

// Endpoint to accept prayer requests
app.post("/api/prayer-requests", async (req, res) => {
  try {
    const { name, request } = req.body;

    // Validation: Ensure required fields are provided
    if (!name || !request) {
      return res.status(400).json({
        error: "Name and request are required fields",
      });
    }

    // Check if user has already submitted a prayer request in the last 24 hours
    const yesterday = moment().subtract(1, 'days');
    const existingRequest = await PrayerRequest.findOne({
      name,
      createdAt: { $gte: yesterday.toDate() }
    });

    if (existingRequest) {
      return res.status(400).json({
        error: `${name} you have already submitted a prayer request today. Please try again tomorrow.`
      });
    }

    // Save prayer request to MongoDB
    const newPrayerRequest = new PrayerRequest({
      name,
      request,
    });
    await newPrayerRequest.save();

    // Send a response
    return res.status(201).json({ message: `${name}, your prayer request submitted successfully` });
  } catch (error) {
    console.error("Prayer Request Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to retrieve prayer requests
app.get("/api/prayer-requests", async (req, res) => {
  try {
    const prayerRequests = await PrayerRequest.find();

    // Send the list of prayer requests as JSON response
    return res.status(200).json(prayerRequests);
  } catch (error) {
    console.error("Prayer Requests Retrieval Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// Error handling middleware
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
});
