const express = require("express");
const { requireLogin, requireRole } = require("../middleware/auth");
const Course = require("../models/course.js");

const router = express.Router();

router.get("/courses-list", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch {
    res.status(500).json({ error: "Failed to load courses" });
  }
});

router.post(
  "/add-course",
  requireLogin,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { number, name, subject, credits, description } = req.body;

      if (!number || !name || !subject || !credits || !description) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const newCourse = await Course.create({
        number,
        name,
        subject,
        credits: Number(credits),
        description,
        createdByEmail: req.user.email
      });

      res.json({ message: "Course added", course: newCourse });
    } catch (err) {
      console.error("ADD COURSE ERROR:", err);
      res.status(500).json({ error: "Failed to add course" });
    }
  }
);

router.put(
  "/courses/:id",
  requireLogin,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const { name, number, subject, credits, description } = req.body;

      course.name = name ?? course.name;
      course.number = number ?? course.number;
      course.subject = subject ?? course.subject;
      course.credits =
        credits !== undefined ? Number(credits) : course.credits;
      course.description = description ?? course.description;

      await course.save();
      res.json({ message: "Course updated", course });
    } catch {
      res.status(500).json({ error: "Failed to update course" });
    }
  }
);

router.delete(
  "/courses/:id",
  requireLogin,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      await course.deleteOne();
      res.json({ message: "Course deleted" });
    } catch {
      res.status(500).json({ error: "Failed to delete course" });
    }
  }
);

module.exports = router;
