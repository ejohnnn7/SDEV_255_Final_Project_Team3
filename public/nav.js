// public/nav.js
(function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Highlight active nav link
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  // Fetch the current user (teacher, student, or null)
  fetch('/me')
    .then(res => res.json())
    .then(user => {
      const navList = document.querySelector('.nav-links');
      const loginBtn = document.getElementById('nav-login');
      const logoutBtn = document.getElementById('nav-logout');

      if (!navList) return;

      // Remove old dashboard links so we don't duplicate them
      navList.querySelectorAll('[data-dashboard]').forEach(el => el.remove());

      if (user) {
        // ---- LOGGED-IN USER ----
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = '';

        // Teacher dashboard
        if (user.role === 'teacher') {
          const li = document.createElement('li');
          li.setAttribute("data-dashboard", "teacher");
          li.innerHTML = `<a href="teacher-dashboard.html">Teacher Dashboard</a>`;
          navList.appendChild(li);
        }

        // Student dashboard
        if (user.role === 'student') {
          const li = document.createElement('li');
          li.setAttribute("data-dashboard", "student");
          li.innerHTML = `<a href="student-dashboard.html">Student Dashboard</a>`;
          navList.appendChild(li);
        }

      } else {
        // ---- LOGGED OUT ----
        if (loginBtn) loginBtn.style.display = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    })
    .catch(() => {
      // If /me fails, assume logged-out state
      const loginBtn = document.getElementById('nav-login');
      const logoutBtn = document.getElementById('nav-logout');
      if (loginBtn) loginBtn.style.display = '';
      if (logoutBtn) logoutBtn.style.display = 'none';
    });
})();
