// =============================
// Render Available Courses
// =============================
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
      </div>
    </div>
  `).join('');
}

// =============================
// Render Student Schedule (WITH DROP BUTTON)
// =============================
function renderSchedule(list) {
  document.getElementById('mySchedule').innerHTML = list.map(c => `
    <div class="course-card">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>

      <div class="card-actions">
        <form action="/student/drop-course/${c.id}" method="POST">
          <button class="danger-btn" type="submit">Drop</button>
        </form>
      </div>
    </div>
  `).join('');

  const credits = list.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  document.getElementById('sum-credits').textContent = credits;
  document.getElementById('sum-count').textContent = list.length;
}

// =============================
// Load Available Courses
// =============================
function loadAllCourses() {
  fetch('/courses-list')
    .then(res => res.json())
    .then(data => {
      window.__allCourses = data;
      renderAvailableCourses(data);
    })
    .catch(() => alert('Error loading courses'));
}

// =============================
// Load Student Schedule
// =============================
function loadSchedule() {
  fetch('/student/schedule')
    .then(res => res.json())
    .then(renderSchedule)
    .catch(() => alert('Error loading schedule'));
}

// =============================
// Search Available Courses
// =============================
function searchAvailable() {
  const name = document.getElementById('s-searchName').value.toLowerCase();
  const number = document.getElementById('s-searchNumber').value.toLowerCase();
  const subject = document.getElementById('s-filterSubject').value.toLowerCase();

  const filtered = (window.__allCourses || []).filter(c => {
    const byName = name ? c.name.toLowerCase().includes(name) : true;
    const byNumber = number ? String(c.number).toLowerCase().includes(number) : true;
    const bySubject = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNumber && bySubject;
  });

  renderAvailableCourses(filtered);
}

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('s-searchBtn')
    .addEventListener('click', searchAvailable);

  fetch('/me')
    .then(res => res.json())
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
