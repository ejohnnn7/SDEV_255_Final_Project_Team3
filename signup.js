document.addEventListener("DOMContentLoaded", () => {
  const studentForm = document.getElementById("student-signup-form");
  const teacherForm = document.getElementById("teacher-signup-form");

  if (studentForm) {
    studentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("student-name").value.trim();
      const email = document.getElementById("student-email").value.trim();
      const password = document.getElementById("student-password").value;

      try {
        const res = await fetch("/signup/student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Student signup failed");
          return;
        }

        alert("Student account created successfully. Please log in.");
        window.location.href = "login.html";

      } catch {
        alert("Network error during student signup");
      }
    });
  }

  if (teacherForm) {
    teacherForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("teacher-name").value.trim();
      const email = document.getElementById("teacher-email").value.trim();
      const password = document.getElementById("teacher-password").value;

      try {
        const res = await fetch("/signup/teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Teacher signup failed");
          return;
        }

        alert("Teacher account created successfully. Please log in.");
        window.location.href = "login.html";

      } catch {
        alert("Network error during teacher signup");
      }
    });
  }
});
