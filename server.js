// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const port = process.env.PORT || 8000;

// import routes
const authRoutes = require("./routes/auth");
const departmentRoutes = require('./routes/departmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
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
app.use("/api/refresh", require("./routes/refresh"));
app.use("/api/logout", require("./routes/logout"));
app.use('/api', departmentRoutes);
app.use('/api', feedbackRoutes);


// Health check route
app.get('/health-check', async (req, res) => {
    return res.status(200).json({
        success: 'Success',
    });
});

// Error handling middleware
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
});
