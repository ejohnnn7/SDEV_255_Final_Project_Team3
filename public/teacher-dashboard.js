let currentUser = null;

function fetchMe() {
  return fetch("/me")
    .then((res) => res.json())
    .then((user) => {
      currentUser = user;
      if (!user || user.role !== "teacher") {
        window.location.href = "login.html";
      }
    })
    .catch(() => {
      window.location.href = "login.html";
    });
}

function renderTeacherCourses(list) {
  const container = document.getElementById("teacherCourses");

  container.innerHTML = list
    .map(
      (c) => `
    <div class="course-card" data-id="${c.id}">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Subject:</strong> ${c.subject}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>

      <div class="card-actions" style="display:flex; gap:8px;">
        <button class="secondary-btn toggle-edit-btn" data-id="${c.id}">Edit</button>
        <button class="danger-btn delete-course-btn" data-id="${c.id}">Delete</button>
      </div>

      <form class="course-form edit-form" style="display:none; margin-top:8px;">
        <input name="name" placeholder="Edit name" value="${c.name}">
        <input name="number" placeholder="Edit number" value="${c.number}">
        <input name="subject" placeholder="Edit subject" value="${c.subject}">
        <input name="credits" type="number" placeholder="Edit credits" value="${c.credits}">
        <textarea name="description" placeholder="Edit description">${c.description}</textarea>
        <button class="primary-btn" type="submit">Save changes</button>
      </form>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".toggle-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".course-card");
      const form = card.querySelector(".edit-form");
      form.style.display = form.style.display === "none" ? "block" : "none";
    });
  });

  document.querySelectorAll(".edit-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const card = form.closest(".course-card");
      const id = card.getAttribute("data-id");

      const formData = new FormData(form);
      const body = {
        name: formData.get("name"),
        number: formData.get("number"),
        subject: formData.get("subject"),
        credits: formData.get("credits"),
        description: formData.get("description"),
      };

      try {
        const res = await fetch(`/courses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Error updating course");
          return;
        }

        alert("Course updated successfully");
        loadTeacherCourses();
      } catch {
        alert("Network error while updating course");
      }
    });
  });

  document.querySelectorAll(".delete-course-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");

      if (!confirm("Are you sure you want to delete this course?")) return;

      try {
        const res = await fetch(`/courses/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Error deleting course");
          return;
        }

        alert("Course deleted successfully");
        loadTeacherCourses();
      } catch {
        alert("Network error while deleting course");
      }
    });
  });
}

function updateStats(list) {
  const count = list.length;
  const credits = list.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  const last = list.slice().sort((a, b) => b.id - a.id)[0];

  document.getElementById("stat-my-count").textContent = count;
  document.getElementById("stat-my-credits").textContent = credits;
  document.getElementById("stat-last-added").textContent = last
    ? `${last.number} — ${last.name}`
    : "—";
}

function loadTeacherCourses() {
  fetch("/courses-list")
    .then((res) => res.json())
    .then((data) => {
      const mine = data.filter((c) => c.createdByEmail === currentUser.email);
      window.__teacherList = mine;
      renderTeacherCourses(mine);
      updateStats(mine);
    })
    .catch(() => alert("Error loading courses"));
}

function searchTeacherCourses() {
  const q = document.getElementById("t-searchName").value.trim().toLowerCase();
  const num = document.getElementById("t-searchNumber").value.trim().toLowerCase();
  const subject = document.getElementById("t-filterSubject").value.trim().toLowerCase();

  const filtered = (window.__teacherList || []).filter((c) => {
    const byName = q ? c.name.toLowerCase().includes(q) : true;
    const byNum = num ? String(c.number).toLowerCase().includes(num) : true;
    const bySub = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNum && bySub;
  });

  renderTeacherCourses(filtered);
}

function initAddCourseForm() {
  const form = document.getElementById("add-course-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const body = {
      number: formData.get("number"),
      name: formData.get("name"),
      subject: formData.get("subject"),
      credits: formData.get("credits"),
      description: formData.get("description"),
    };

    try {
      const res = await fetch("/add-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error adding course");
        return;
      }

      alert("Course added successfully");
      form.reset();
      loadTeacherCourses();
    } catch {
      alert("Network error while adding course");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("t-searchBtn")
    ?.addEventListener("click", searchTeacherCourses);

  fetchMe().then(() => {
    initAddCourseForm();
    loadTeacherCourses();
  });
});
