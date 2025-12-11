const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ========= Middleware =========
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(session({
  secret: 'sdev255secret',
  resave: false,
  saveUninitialized: true
}));

// ========= Data files =========
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const coursesFile = path.join(dataDir, 'courses.json');
const schedulesFile = path.join(dataDir, 'schedules.json');

// Create files if missing (fresh install protection)
function ensureFileExists(file, defaultVal) {
  if (!fs.existsSync(file)) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2));
    console.log(`[INIT] Created missing file: ${path.basename(file)}`);
  }
}

// Ensure required data files exist
ensureFileExists(usersFile, []);
ensureFileExists(coursesFile, []);
ensureFileExists(schedulesFile, {});

// ========= JSON Helpers =========
function loadJson(file, defaultVal) {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file));
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
      return defaultVal;
    }
  }
  return defaultVal;
}

function saveJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
  }
}

// Initialize stores
let users = loadJson(usersFile, []);
let courses = loadJson(coursesFile, []);
let schedules = loadJson(schedulesFile, {});

// ========= Helpers & Auth =========
function requireLogin(req, res, next) {
  if (!req.session?.user) return res.redirect('/login');
  next();
}

function requireTeacher(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'teacher') {
    return res.status(403).send('Unauthorized: teacher role required');
  }
  next();
}

function requireStudent(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'student') {
    return res.status(403).send('Unauthorized: student role required');
  }
  next();
}

// Current user info (used by nav.js)
app.get('/me', (req, res) => {
  res.json(req.session?.user || null);
});

// ========= Page routes =========
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/courses', (req, res) => res.sendFile(path.join(__dirname, 'public', 'courses.html')));

// Protected dashboards
app.get('/teacher-dashboard', requireTeacher, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teacher-dashboard.html'));
});
app.get('/student-dashboard', requireStudent, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student-dashboard.html'));
});

// ========= Signup/Login/Logout =========
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

app.post('/signup/student', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).send('Missing fields');

  const normalized = normalizeEmail(email);
  if (users.find(u => u.email === normalized)) {
    return res.status(400).send('Email already registered');
  }

  const user = { role: 'student', name: name.trim(), email: normalized, password };
  users.push(user);
  schedules[normalized] = schedules[normalized] || [];

  saveJson(usersFile, users);
  saveJson(schedulesFile, schedules);

  res.redirect('/login');
});

app.post('/signup/teacher', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).send('Missing fields');

  const normalized = normalizeEmail(email);
  if (users.find(u => u.email === normalized)) {
    return res.status(400).send('Email already registered');
  }

  const user = { role: 'teacher', name: name.trim(), email: normalized, password };
  users.push(user);

  saveJson(usersFile, users);
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const normalized = normalizeEmail(email);

  const user = users.find(u => u.email === normalized && u.password === password);
  if (!user) return res.status(401).send('Invalid credentials');

  req.session.user = { role: user.role, name: user.name, email: user.email };

  if (user.role === 'teacher') return res.redirect('/teacher-dashboard');
  return res.redirect('/student-dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ========= Courses CRUD =========
app.get('/courses-list', (req, res) => {
  res.json(courses);
});

app.get('/course-details/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const course = courses.find(c => c.id === id);
  if (!course) return res.status(404).send('Course not found');
  res.json(course);
});

app.post('/add-course', requireTeacher, (req, res) => {
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

app.post('/edit-course/:id', requireTeacher, (req, res) => {
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

app.post('/delete-course/:id', requireTeacher, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const course = courses.find(c => c.id === id);
  if (!course) return res.status(404).send('Course not found');

  if (course.createdByEmail !== req.session.user.email) {
    return res.status(403).send('Not allowed to delete this course');
  }

  courses = courses.filter(c => c.id !== id);
  saveJson(coursesFile, courses);

  Object.keys(schedules).forEach(email => {
    schedules[email] = (schedules[email] || []).filter(cid => cid !== id);
  });

  saveJson(schedulesFile, schedules);
  res.redirect('/teacher-dashboard');
});

// ========= Search =========
app.get('/search', (req, res) => {
  const { q = '', number = '', subject = '' } = req.query;
  const qLower = q.toLowerCase();

  const results = courses.filter(c => {
    const matchesName = q ? (c.name || '').toLowerCase().includes(qLower) : true;
    const matchesNumber = number ? String(c.number).toLowerCase().includes(String(number)) : true;
    const matchesSubject = subject ? (c.subject || '').toLowerCase() === subject.toLowerCase() : true;
    return matchesName && matchesNumber && matchesSubject;
  });

  res.json(results);
});

// ========= Student schedule =========
app.post('/student/add-course/:id', requireStudent, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const course = courses.find(c => c.id === id);
  if (!course) return res.status(404).send('Course not found');

  const email = req.session.user.email;
  schedules[email] = schedules[email] || [];

  if (!schedules[email].includes(id)) {
    schedules[email].push(id);
    saveJson(schedulesFile, schedules);
  }

  res.redirect('/student-dashboard');
});

app.post('/student/drop-course/:id', requireStudent, (req, res) => {
  const id = parseInt(req.params.id, 10);

  const email = req.session.user.email;
  schedules[email] = (schedules[email] || []).filter(cid => cid !== id);

  saveJson(schedulesFile, schedules);
  res.redirect('/student-dashboard');
});

app.get('/student/schedule', requireStudent, (req, res) => {
  const email = req.session.user.email;
  const courseIds = schedules[email] || [];
  const myCourses = courses.filter(c => courseIds.includes(c.id));
  res.json(myCourses);
});

// ========= Start =========
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
