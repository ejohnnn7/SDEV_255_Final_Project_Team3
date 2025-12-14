const express = require("express");
const path = require("path");
const session = require("express-session");
const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const coursesRouter = require("./routes/courses");

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
