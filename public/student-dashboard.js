function renderAvailableCourses(list) {
  document.getElementById("allCourses").innerHTML = list
    .map(
      (c) => `
    <div class="course-card" data-id="${c.id}">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Subject:</strong> ${c.subject}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>

      <div class="card-actions">
        <button class="primary-btn add-course-btn" type="button" data-id="${c.id}">
          Add
        </button>
      </div>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".add-course-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");

      try {
        const res = await fetch(`/student/add-course/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Error adding course");
          return;
        }

        loadSchedule();
      } catch {
        alert("Network error while adding course");
      }
    });
  });
}

function renderSchedule(list) {
  document.getElementById("mySchedule").innerHTML = list
    .map(
      (c) => `
    <div class="course-card" data-id="${c.id}">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>

      <div class="card-actions">
        <button class="danger-btn drop-course-btn" type="button" data-id="${c.id}">
          Drop
        </button>
      </div>
    </div>
  `
    )
    .join("");

  const credits = list.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  document.getElementById("sum-credits").textContent = credits;
  document.getElementById("sum-count").textContent = list.length;

  document.querySelectorAll(".drop-course-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");

      if (!confirm("Drop this course?")) return;

      try {
        const res = await fetch(`/student/drop-course/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Error dropping course");
          return;
        }

        loadSchedule();
      } catch {
        alert("Network error while dropping course");
      }
    });
  });
}

function loadAllCourses() {
  fetch("/courses-list")
    .then((res) => res.json())
    .then((data) => {
      window.__allCourses = data;
      renderAvailableCourses(data);
    })
    .catch(() => alert("Error loading courses"));
}

function loadSchedule() {
  fetch("/student/schedule")
    .then((res) => res.json())
    .then(renderSchedule)
    .catch(() => alert("Error loading schedule"));
}

function searchAvailable() {
  const name = document.getElementById("s-searchName").value.toLowerCase();
  const number = document.getElementById("s-searchNumber").value.toLowerCase();
  const subject = document.getElementById("s-filterSubject").value.toLowerCase();

  const filtered = (window.__allCourses || []).filter((c) => {
    const byName = name ? c.name.toLowerCase().includes(name) : true;
    const byNumber = number
      ? String(c.number).toLowerCase().includes(number)
      : true;
    const bySubject = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNumber && bySubject;
  });

  renderAvailableCourses(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("s-searchBtn")?.addEventListener("click", searchAvailable);

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
