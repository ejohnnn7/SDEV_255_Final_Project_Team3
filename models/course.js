const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdByEmail: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Course", courseSchema);
