require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
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
app.use("/api/refresh", require("./routes/refresh"));
app.use("/api/logout", require("./routes/logout"));

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
});
