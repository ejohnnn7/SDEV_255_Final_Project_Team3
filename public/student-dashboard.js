// Store all courses globally
window.__allCourses = [];

// Render available courses with Add buttons
function renderAvailableCourses(list) {
  const container = document.getElementById("allCourses");
  if (!container) return;

  container.innerHTML = list
    .map(
      (c) => `
    <div class="course-card" data-id="${c._id}">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Subject:</strong> ${c.subject}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>

      <div class="card-actions">
        <button class="primary-btn add-course-btn" type="button" data-id="${c._id}">
          Add
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Attach click events for Add buttons
  document.querySelectorAll(".add-course-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const courseId = btn.getAttribute("data-id");

      // UI feedback while adding
      btn.disabled = true;
      btn.textContent = "Adding...";

      try {
        const res = await fetch("/api/users/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId })
        });

        const data = await res.json();
        if (!res.ok) {
          btn.disabled = false;
          btn.textContent = "Add";
          alert(data.error || "Error adding course");
          return;
        }

        // Confirmation feedback
        btn.textContent = "Added ✓";
        loadSchedule(); // refresh schedule
      } catch {
        btn.disabled = false;
        btn.textContent = "Add";
        alert("Network error while adding course");
      }
    });
  });
}

// Render student's schedule with Drop buttons
function renderSchedule(schedule) {
  const container = document.getElementById("mySchedule");
  if (!container) return;

  const courses = schedule.courses || [];

  container.innerHTML = courses
    .map(
      (c) => `
    <div class="course-card" data-id="${c._id}">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>

      <div class="card-actions">
        <button class="danger-btn drop-course-btn" type="button" data-id="${c._id}">
          Drop
        </button>
      </div>
    </div>
  `
    )
    .join("");

  const credits = courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  document.getElementById("sum-credits").textContent = credits;
  document.getElementById("sum-count").textContent = courses.length;

  // Attach click events for Drop buttons
  document.querySelectorAll(".drop-course-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const courseId = btn.getAttribute("data-id");
      if (!confirm("Drop this course?")) return;

      try {
        const res = await fetch(`/api/users/cart/${courseId}`, {
          method: "DELETE"
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Error dropping course");
          return;
        }

        loadSchedule(); // refresh schedule
      } catch {
        alert("Network error while dropping course");
      }
    });
  });
}

// Load all courses (MongoDB)
function loadAllCourses() {
  fetch("/courses-list")
    .then((res) => res.json())
    .then((data) => {
      window.__allCourses = data;
      renderAvailableCourses(data);
    })
    .catch(() => alert("Error loading courses"));
}

// Load student's schedule (MongoDB)
function loadSchedule() {
  fetch("/api/users/me")
    .then((res) => res.json())
    .then(renderSchedule)
    .catch(() => alert("Error loading schedule"));
}

// Search/filter available courses
function searchAvailable() {
  const name = document.getElementById("s-searchName").value.toLowerCase();
  const number = document.getElementById("s-searchNumber").value.toLowerCase();
  const subject = document.getElementById("s-filterSubject").value.toLowerCase();

  const filtered = (window.__allCourses || []).filter((c) => {
    const byName = name ? c.name.toLowerCase().includes(name) : true;
    const byNumber = number ? String(c.number).toLowerCase().includes(number) : true;
    const bySubject = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNum && bySub;
  });

  renderAvailableCourses(filtered);
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("s-searchBtn")?.addEventListener("click", searchAvailable);

  // Verify student role
  fetch("/me")
    .then((res) => res.json())
    .then((user) => {
      if (!user || user.role !== "student") {
        window.location.href = "login.html";
        return;
      }
      loadAllCourses();
      loadSchedule();
    })
    .catch(() => {
      window.location.href = "login.html";
    });
});
