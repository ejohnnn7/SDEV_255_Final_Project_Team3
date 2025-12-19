const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://ejohn7:NWw5NsIMLHGxTT16@coursemanager.wkuhdtf.mongodb.net/courseManager?retryWrites=true&w=majority&appName=CourseManager";

mongoose.connect(MONGO_URI);

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

module.exports = mongoose;
