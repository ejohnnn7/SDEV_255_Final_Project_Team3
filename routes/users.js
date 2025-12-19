const express = require("express");
const { requireLogin, requireRole } = require("../middleware/auth");
const Schedule = require("../models/schedule");

const router = express.Router();

// Add course to schedule
router.post(
  "/api/users/cart",
  requireLogin,
  requireRole("student"),
  async (req, res) => {
    const { courseId } = req.body;
    const email = req.session.user.email;

    let schedule = await Schedule.findOne({ studentEmail: email });

    if (!schedule) {
      schedule = await Schedule.create({
        studentEmail: email,
        courses: [],
      });
    }

    // Mongo-safe ObjectId comparison
    if (!schedule.courses.some(id => id.toString() === courseId)) {
      schedule.courses.push(courseId);
      await schedule.save();
    }

    res.json({ message: "Course added" });
  }
);

// Remove course from schedule
router.delete(
  "/api/users/cart/:courseId",
  requireLogin,
  requireRole("student"),
  async (req, res) => {
    const email = req.session.user.email;
    const courseId = req.params.courseId;

    const schedule = await Schedule.findOne({ studentEmail: email });
    if (!schedule) {
      return res.json({ message: "Nothing to remove" });
    }

    schedule.courses = schedule.courses.filter(
      id => id.toString() !== courseId
    );
    await schedule.save();

    res.json({ message: "Course removed" });
  }
);

// Get student's schedule
router.get(
  "/api/users/me",
  requireLogin,
  requireRole("student"),
  async (req, res) => {
    const schedule = await Schedule.findOne({
      studentEmail: req.session.user.email,
    }).populate("courses");

    res.json(schedule || { courses: [] });
  }
);

module.exports = router;
