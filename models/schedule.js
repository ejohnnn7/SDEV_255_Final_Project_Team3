const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
    unique: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

module.exports = mongoose.model("Schedule", scheduleSchema);
