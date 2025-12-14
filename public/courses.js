let __allCourses = [];
let currentUser = null;

// Load logged-in user
function fetchMe() {
  return fetch('/me')
    .then(res => res.json())
    .then(data => { currentUser = data; });
}

// Render course cards
function renderCourses(list) {
  const container = document.getElementById('coursesGrid');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<p style="color:#555;">No courses found.</p>`;
    return;
  }

  container.innerHTML = list.map(c => {
    // Teacher controls (edit + delete)
    const teacherControls = (currentUser?.role === 'teacher' && currentUser.email === c.createdByEmail)
      ? `
        <div class="card-actions">
          <form action="/edit-course/${c.id}" method="POST" class="course-form no-margin">
            <input name="name" placeholder="Edit name">
            <input name="number" placeholder="Edit number">
            <input name="subject" placeholder="Edit subject">
            <input name="credits" type="number" placeholder="Edit credits">
            <textarea name="description" placeholder="Edit description"></textarea>
            <button class="secondary-btn" type="submit">Save changes</button>
          </form>
          <form action="/delete-course/${c.id}" method="POST">
            <button class="danger-btn" type="submit">Delete</button>
          </form>
        </div>
      ` : '';

    // Student controls (add/drop)
    const studentControls = currentUser?.role === 'student'
      ? `
        <div class="card-actions">
          <form action="/student/add-course/${c.id}" method="POST">
            <button class="primary-btn" type="submit">Add</button>
          </form>
          <form action="/student/drop-course/${c.id}" method="POST">
            <button class="danger-btn" type="submit">Drop</button>
          </form>
        </div>
      ` : '';

    return `
      <div class="course-card">
        <h3>${c.number} — ${c.name}</h3>
        <p>${c.description}</p>
        <p><strong>Subject:</strong> ${c.subject}</p>
        <p><strong>Credits:</strong> ${c.credits}</p>
        ${teacherControls}
        ${studentControls}
      </div>
    `;
  }).join('');
}

// Load all courses
function loadCourses() {
  fetch('/courses-list')
    .then(res => res.json())
    .then(data => {
      __allCourses = data || [];
      renderCourses(__allCourses);
    })
    .catch(() => {
      const container = document.getElementById('coursesGrid');
      if (container) container.innerHTML = `<p style="color:#b33;">Error loading courses.</p>`;
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
