require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();

// import routes
const authRoutes = require("./routes/auth");

// To connect to database
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// app middlewares
app.use(cookieParser());
app.use(morgan("dev"));
app.use(bodyParser.json());

app.use(cors()); // allows all origins
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: process.env.CLIENT_URL }));
} else {
  app.use(cors());
}

// Routes
app.use("/api", authRoutes);
app.use("/api/refresh", require("./routes/refresh"));
app.use("/api/logout", require("./routes/logout"));

const port = process.env.PORT || 8000;

mongoose.connection.once("open", () => {
  app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
});
