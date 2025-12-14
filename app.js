<<<<<<< HEAD
const express = require("express");
const path = require("path");
const session = require("express-session");
const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const coursesRouter = require("./routes/courses");
=======
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const cors = require('cors');
>>>>>>> c4c6edefbfff1aaa66cb54856c99624f80521d35

const app = express();
const PORT = 3000;

<<<<<<< HEAD
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Data paths
const usersPath = path.join(__dirname, "data", "users.json");
const schedulesPath = path.join(__dirname, "data", "schedules.json");

// Helpers
async function readJson(file, fallback) {
  try {
    if (!(await fs.pathExists(file))) {
      await fs.outputJson(file, fallback, { spaces: 2 });
      return fallback;
    }
    const data = await fs.readJson(file);
    return Array.isArray(fallback) && Array.isArray(data) ? data : data || fallback;
  } catch {
    await fs.outputJson(file, fallback, { spaces: 2 });
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.outputJson(file, data, { spaces: 2 });
}

// Auth helpers
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// Routes: Auth

// Current user
app.get("/me", (req, res) => {
  if (!req.session.user) return res.json(null);
  res.json(req.session.user);
});

// Student signup
app.post("/signup/student", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const users = await readJson(usersPath, []);
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    name,
    email,
    passwordHash: hash,
    role: "student",
  };

  users.push(newUser);
  await writeJson(usersPath, users);
  res.json({ message: "Student created" });
});

// Teacher signup
app.post("/signup/teacher", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const users = await readJson(usersPath, []);
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    name,
    email,
    passwordHash: hash,
    role: "teacher",
  };

  users.push(newUser);
  await writeJson(usersPath, users);
  res.json({ message: "Teacher created" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await readJson(usersPath, []);
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const redirect =
    user.role === "teacher" ? "teacher-dashboard.html" : "student-dashboard.html";

  res.json({ message: "Logged in", redirect });
});

// Logout (POST)
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out", redirect: "login.html" });
  });
});

// Student schedule routes
app.get("/student/schedule", requireLogin, requireRole("student"), async (req, res) => {
  const schedules = await readJson(schedulesPath, []);
  const userSchedule = schedules.find((s) => s.studentEmail === req.session.user.email);
  res.json(userSchedule?.courses || []);
});

app.post(
  "/student/add-course/:id",
  requireLogin,
  requireRole("student"),
  async (req, res) => {
    const courseId = Number(req.params.id);
    const schedules = await readJson(schedulesPath, []);
    const courses = await readJson(path.join(__dirname, "data", "courses.json"), []);

    const course = courses.find((c) => c.id === courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    let schedule = schedules.find((s) => s.studentEmail === req.session.user.email);
    if (!schedule) {
      schedule = { studentEmail: req.session.user.email, courses: [] };
      schedules.push(schedule);
    }

    if (schedule.courses.some((c) => c.id === courseId)) {
      return res.status(400).json({ error: "Course already in schedule" });
    }

    schedule.courses.push(course);
    await writeJson(schedulesPath, schedules);
    res.json({ message: "Course added" });
  }
);

app.delete(
  "/student/drop-course/:id",
  requireLogin,
  requireRole("student"),
  async (req, res) => {
    const courseId = Number(req.params.id);
    const schedules = await readJson(schedulesPath, []);

    const schedule = schedules.find((s) => s.studentEmail === req.session.user.email);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    schedule.courses = schedule.courses.filter((c) => c.id !== courseId);
    await writeJson(schedulesPath, schedules);
    res.json({ message: "Course dropped" });
  }
);

// Courses routes
app.use("/", coursesRouter);

// Fallback to index for unknown routes (optional)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

=======
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

// ========= Import Modular Course Routes =========
const courseRoutes = require('./routes/courses')(
  courses,
  schedules,
  saveJson,
  coursesFile,
  schedulesFile,
  requireTeacher
);

app.use('/', courseRoutes);

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
>>>>>>> c4c6edefbfff1aaa66cb54856c99624f80521d35
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
