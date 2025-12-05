// Renders the list of available courses
function renderAvailableCourses(list) {
  document.getElementById('allCourses').innerHTML = list.map(c => `
    <div class="course-card">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Subject:</strong> ${c.subject}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>
      
      <div class="card-actions">
        <form action="/student/add-course/${c.id}" method="POST">
          <button class="primary-btn" type="submit">Add</button>
        </form>
        <form action="/student/drop-course/${c.id}" method="POST">
          <button class="danger-btn" type="submit">Drop</button>
        </form>
      </div>
    </div>
  `).join('');
}

// Renders the student's schedule
function renderSchedule(list) {
  document.getElementById('mySchedule').innerHTML = list.map(c => `
    <div class="course-card">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
    </div>
  `).join('');

  const credits = list.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  document.getElementById('sum-credits').textContent = credits;
  document.getElementById('sum-count').textContent = list.length;
}

// Load all available courses
function loadAllCourses() {
  fetch('/courses-list')
    .then(r => r.json())
    .then(data => {
      window.__allCourses = data;
      renderAvailableCourses(data);
    })
    .catch(() => alert("Error loading courses."));
}

// Load student's schedule
function loadSchedule() {
  fetch('/student/schedule')
    .then(r => r.json())
    .then(renderSchedule)
    .catch(() => alert("Error loading schedule."));
}

// Search filters for available courses
function searchAvailable() {
  const q = document.getElementById('s-searchName').value.trim().toLowerCase();
  const num = document.getElementById('s-searchNumber').value.trim().toLowerCase();
  const subject = document.getElementById('s-filterSubject').value.trim().toLowerCase();

  const filtered = (window.__allCourses || []).filter(c => {
    const byName = q ? c.name.toLowerCase().includes(q) : true;
    const byNum = num ? String(c.number).toLowerCase().includes(num) : true;
    const bySub = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNum && bySub;
  });

  renderAvailableCourses(filtered);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('s-searchBtn')?.addEventListener('click', searchAvailable);

  // Ensure role is student; if not, redirect
  fetch('/me')
    .then(r => r.json())
    .then(user => {
      if (!user || user.role !== 'student') {
        window.location.href = 'login.html';
        return;
      }

      loadAllCourses();
      loadSchedule();
    })
    .catch(() => {
      window.location.href = 'login.html';
    });
});
