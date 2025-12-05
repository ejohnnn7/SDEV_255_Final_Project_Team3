// public/teacher-dashboard.js
let currentUser = null;

function fetchMe() {
  return fetch('/me').then(r => r.json()).then(u => {
    currentUser = u;
    if (!currentUser || currentUser.role !== 'teacher') {
      window.location.href = 'login.html';
    }
  });
}

function renderTeacherCourses(list) {
  const container = document.getElementById('teacherCourses');
  container.innerHTML = list.map(c => `
    <div class="course-card">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Subject:</strong> ${c.subject}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>
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
    </div>
  `).join('');
}

function updateStats(list) {
  const count = list.length;
  const credits = list.reduce((sum, c) => sum + (parseInt(c.credits, 10) || 0), 0);
  const last = list.slice().sort((a,b) => b.id - a.id)[0];
  document.getElementById('stat-my-count').textContent = count;
  document.getElementById('stat-my-credits').textContent = credits;
  document.getElementById('stat-last-added').textContent = last ? `${last.number} — ${last.name}` : '—';
}

function loadTeacherCourses() {
  fetch('/courses-list').then(r => r.json()).then(data => {
    const mine = data.filter(c => c.createdByEmail === currentUser?.email);
    renderTeacherCourses(mine);
    updateStats(mine);
    window.__teacherList = mine;
  });
}

function searchTeacherCourses() {
  const q = document.getElementById('t-searchName').value.trim().toLowerCase();
  const num = document.getElementById('t-searchNumber').value.trim().toLowerCase();
  const subject = document.getElementById('t-filterSubject').value.trim().toLowerCase();
  const filtered = (window.__teacherList || []).filter(c => {
    const byName = q ? c.name.toLowerCase().includes(q) : true;
    const byNum = num ? String(c.number).toLowerCase().includes(num) : true;
    const bySub = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNum && bySub;
  });
  renderTeacherCourses(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('t-searchBtn')?.addEventListener('click', searchTeacherCourses);
  fetchMe().then(loadTeacherCourses);
});
