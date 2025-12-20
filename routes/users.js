const express = require("express");
const { requireLogin, requireRole } = require("../middleware/auth");
const Schedule = require("../models/schedule");
const User = require("../models/user");

const router = express.Router();

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

    if (!schedule.courses.some(id => id.toString() === courseId)) {
      schedule.courses.push(courseId);
      await schedule.save();
    }

    const user = await User.findOne({ email });

    if (!user.registeredCourses.some(id => id.toString() === courseId)) {
      user.registeredCourses.push(courseId);
      await user.save();
    }

    res.json({ message: "Course added" });
  }
);

router.delete(
  "/api/users/cart/:courseId",
  requireLogin,
  requireRole("student"),
  async (req, res) => {
    const email = req.session.user.email;
    const courseId = req.params.courseId;

    const schedule = await Schedule.findOne({ studentEmail: email });
    if (schedule) {
      schedule.courses = schedule.courses.filter(
        id => id.toString() !== courseId
      );
      await schedule.save();
    }

    const user = await User.findOne({ email });
    user.registeredCourses = user.registeredCourses.filter(
      id => id.toString() !== courseId
    );
    await user.save();

    res.json({ message: "Course removed" });
  }
);

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
