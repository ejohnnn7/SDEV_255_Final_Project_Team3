let __allCourses = [];
let currentUser = null;

// Load logged-in user
function fetchMe() {
  return fetch("/me")
    .then(res => res.json())
    .then(data => { currentUser = data; })
    .catch(() => { currentUser = null; });
}

// Render course cards
function renderCourses(list) {
  const container = document.getElementById("coursesGrid");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<p>No courses found.</p>`;
    return;
  }

  container.innerHTML = list.map(c => {
    // ONLY show Add button for MongoDB-backed courses
    const studentControls =
      currentUser?.role === "student" && c._id
        ? `
          <div class="card-actions">
            <button 
              class="primary-btn add-btn"
              data-id="${c._id}">
              Add to Schedule
            </button>
          </div>
        `
        : "";

    return `
      <div class="course-card">
        <h3>${c.number} — ${c.name}</h3>
        <p>${c.description}</p>
        <p><strong>Subject:</strong> ${c.subject}</p>
        <p><strong>Credits:</strong> ${c.credits}</p>
        ${studentControls}
      </div>
    `;
  }).join("");

  // Attach handlers after render
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const courseId = btn.dataset.id;

      const res = await fetch("/api/users/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });

      if (res.ok) {
        btn.textContent = "Registered";
        btn.disabled = true;
      }
    });
  });
}

// Load all courses (existing JSON endpoint)
function loadCourses() {
  fetch("/courses-list")
    .then(res => res.json())
    .then(data => {
      __allCourses = data || [];
      renderCourses(__allCourses);
    })
    .catch(() => {
      const container = document.getElementById("coursesGrid");
      if (container) {
        container.innerHTML = `<p>Error loading courses.</p>`;
      }
    });
}

// Search/filter courses locally
function searchCourses() {
  const name = document.getElementById("searchName").value.trim().toLowerCase();
  const number = document.getElementById("searchNumber").value.trim().toLowerCase();
  const subject = document.getElementById("filterSubject").value.trim().toLowerCase();

  const filtered = __allCourses.filter(c => {
    const byName = name ? c.name.toLowerCase().includes(name) : true;
    const byNumber = number ? String(c.number).toLowerCase().includes(number) : true;
    const bySubject = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNumber && bySubject;
  });

  renderCourses(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchBtn")?.addEventListener("click", searchCourses);
  fetchMe().then(loadCourses);
});
