const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");

require("dotenv").config();
require("./db");

const User = require("./models/user");
const coursesRouter = require("./routes/courses");
const userRoutes = require("./routes/users");
const { requireLogin, requireRole } = require("./middleware/auth");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_fallback_secret_change_me",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/me", (req, res) => {
  if (!req.session.user) return res.json(null);
  res.json(req.session.user);
});

app.post("/signup/student", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role: "student",
  });

  res.json({ message: "Student created" });
});

app.post("/signup/teacher", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role: "teacher",
  });

  res.json({ message: "Teacher created" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  req.session.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const redirect =
    user.role === "teacher"
      ? "teacher-dashboard.html"
      : "student-dashboard.html";

  res.json({ message: "Logged in", redirect });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out", redirect: "login.html" });
  });
});

app.use("/", coursesRouter);
app.use(userRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
