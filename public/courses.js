// public/courses.js
let currentUser = null;

function fetchMe() {
  return fetch('/me').then(res => res.json()).then(u => { currentUser = u; });
}

function renderCourses(list) {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = list.map(c => {
    const teacherControls = (currentUser?.role === 'teacher' && currentUser.email === c.createdByEmail) ? `
      <div class="card-actions">
        <form action="/edit-course/${c.id}" method="POST" class="course-form" style="margin:0;">
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

    const studentControls = currentUser?.role === 'student' ? `
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

function loadCourses() {
  fetch('/courses-list').then(res => res.json()).then(renderCourses);
}

function searchCourses() {
  const q = document.getElementById('searchName').value.trim();
  const number = document.getElementById('searchNumber').value.trim();
  const subject = document.getElementById('filterSubject').value.trim();
  const params = new URLSearchParams({ q, number, subject });
  fetch('/search?' + params.toString())
    .then(res => res.json())
    .then(renderCourses);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBtn').addEventListener('click', searchCourses);
  fetchMe().then(loadCourses);
});
