<<<<<<< HEAD
const express = require("express");
const path = require("path");
const fs = require("fs-extra");

const router = express.Router();

const coursesPath = path.join(__dirname, "..", "data", "courses.json");

async function readCourses() {
  try {
    if (!(await fs.pathExists(coursesPath))) {
      await fs.outputJson(coursesPath, [], { spaces: 2 });
      return [];
    }
    const data = await fs.readJson(coursesPath);
    return Array.isArray(data) ? data : [];
  } catch {
    await fs.outputJson(coursesPath, [], { spaces: 2 });
    return [];
  }
}

async function writeCourses(courses) {
  await fs.outputJson(coursesPath, courses, { spaces: 2 });
}

// List all courses
router.get("/courses-list", async (req, res) => {
  const courses = await readCourses();
  res.json(courses);
});

// Add course (teacher)
router.post("/add-course", async (req, res) => {
  const { number, name, subject, credits, description } = req.body;
  if (!number || !name || !subject || !credits || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const courses = await readCourses();
  const newCourse = {
    id: Date.now(),
    number,
    name,
    subject,
    credits: Number(credits),
    description,
    createdAt: new Date().toISOString(),
    createdByEmail: req.session?.user?.email || null,
  };

  courses.push(newCourse);
  await writeCourses(courses);

  res.json({ message: "Course added", course: newCourse });
});

// Update course
router.put("/courses/:id", async (req, res) => {
  const id = Number(req.params.id);
  const courses = await readCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Course not found" });

  const { name, number, subject, credits, description } = req.body;

  courses[idx] = {
    ...courses[idx],
    name: name ?? courses[idx].name,
    number: number ?? courses[idx].number,
    subject: subject ?? courses[idx].subject,
    credits: credits !== undefined ? Number(credits) : courses[idx].credits,
    description: description ?? courses[idx].description,
  };

  await writeCourses(courses);
  res.json({ message: "Course updated", course: courses[idx] });
});

// Delete course
router.delete("/courses/:id", async (req, res) => {
  const id = Number(req.params.id);
  const courses = await readCourses();
  const exists = courses.some((c) => c.id === id);
  if (!exists) return res.status(404).json({ error: "Course not found" });

  const filtered = courses.filter((c) => c.id !== id);
  await writeCourses(filtered);
  res.json({ message: "Course deleted" });
});

module.exports = router;
=======
const express = require('express');
const router = express.Router();

module.exports = (courses, schedules, saveJson, coursesFile, schedulesFile, requireTeacher) => {

  // ========= Courses CRUD =========
  router.get('/courses-list', (req, res) => {
    res.json(courses);
  });

  // Course Details

  router.get('/course-details/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const course = courses.find(c => c.id === id);
    if (!course) return res.status(404).send('Course not found');
    res.json(course);
  });

  // Add course

  router.post('/add-course', requireTeacher, (req, res) => {
    const { number, name, description, subject, credits } = req.body;
    if (!number || !name || !description || !subject || !credits) {
      return res.status(400).send('Missing fields');
    }

    const id = Date.now();
    const createdByEmail = req.session.user.email;

    const course = {
      id,
      number: number.trim(),
      name: name.trim(),
      description: description.trim(),
      subject: subject.trim(),
      credits: Number(credits),
      createdByEmail
    };

    courses.push(course);
    saveJson(coursesFile, courses);

    res.redirect('/teacher-dashboard');
  });

  // Edit Course

  router.post('/edit-course/:id', requireTeacher, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const course = courses.find(c => c.id === id);
    if (!course) return res.status(404).send('Course not found');

    if (course.createdByEmail !== req.session.user.email) {
      return res.status(403).send('Not allowed to edit this course');
    }

    const { number, name, description, subject, credits } = req.body;
    if (number) course.number = number.trim();
    if (name) course.name = name.trim();
    if (description) course.description = description.trim();
    if (subject) course.subject = subject.trim();
    if (credits) course.credits = Number(credits);

    saveJson(coursesFile, courses);
    res.redirect('/teacher-dashboard');
  });

  // Delete course

  router.post('/delete-course/:id', requireTeacher, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const course = courses.find(c => c.id === id);
    if (!course) return res.status(404).send('Course not found');

    if (course.createdByEmail !== req.session.user.email) {
      return res.status(403).send('Not allowed to delete this course');
    }

    // Remove the course
    const updated = courses.filter(c => c.id !== id);
    courses.length = 0;
    courses.push(...updated);

    saveJson(coursesFile, courses);

    // Remove from all student schedules
    Object.keys(schedules).forEach(email => {
      schedules[email] = (schedules[email] || []).filter(cid => cid !== id);
    });

    saveJson(schedulesFile, schedules);

    res.redirect('/teacher-dashboard');
  });

  return router;
};
>>>>>>> c4c6edefbfff1aaa66cb54856c99624f80521d35
