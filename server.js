const express = require("express");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env"});

// Connect to database
connectDB();

// Route files
const trips = require("./routes/trips");
const auth = require("./routes/auth");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileUpload());


// Mount routers
app.use("/trips", trips);
app.use("/auth", auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);