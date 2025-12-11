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
