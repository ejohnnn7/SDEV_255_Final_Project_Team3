// public/nav.js
(function() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });

  fetch('/me')
    .then(r => r.json())
    .then(user => {
      const list = document.querySelector('.nav-links');
      const loginBtn = document.getElementById('nav-login');
      const logoutBtn = document.getElementById('nav-logout');

      if (!list) return;

      // Remove any previously injected dashboard links to avoid duplicates
      list.querySelectorAll('[data-dashboard-link]').forEach(el => el.remove());

      if (user && user.role === 'teacher') {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "/teacher-dashboard";
        a.textContent = "Teacher Dashboard";
        li.setAttribute('data-dashboard-link', 'teacher');
        li.appendChild(a);
        list.appendChild(li);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = '';
      } else if (user && user.role === 'student') {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "/student-dashboard";
        a.textContent = "Student Dashboard";
        li.setAttribute('data-dashboard-link', 'student');
        li.appendChild(a);
        list.appendChild(li);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = '';
      } else {
        if (loginBtn) loginBtn.style.display = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    })
    .catch(() => {});
})();
