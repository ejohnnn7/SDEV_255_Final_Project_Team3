<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("nav-login");
  const logoutBtn = document.getElementById("nav-logout");
  const navLinks = document.getElementById("nav-links");
  const heroSignup = document.getElementById("hero-signup");

  fetch("/me")
    .then((res) => res.json())
    .then((user) => {
      const loggedIn = user && user.email;

      if (loggedIn) {
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
      } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
      }

      if (heroSignup) {
        heroSignup.style.display = loggedIn ? "none" : "inline-block";
      }

      if (navLinks && loggedIn) {
        if (!navLinks.querySelector(".nav-dashboard-link")) {
          const li = document.createElement("li");
          li.classList.add("nav-dashboard-link");

          const a = document.createElement("a");
          a.textContent = "Dashboard";

          if (user.role === "teacher") {
            a.href = "teacher-dashboard.html";
          } else if (user.role === "student") {
            a.href = "student-dashboard.html";
          } else {
            a.href = "index.html";
          }

          li.appendChild(a);
          navLinks.appendChild(li);
        }
      }
    })
    .catch(() => {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (heroSignup) heroSignup.style.display = "inline-block";
    });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        window.location.href = data.redirect || "login.html";
      } catch {
        window.location.href = "login.html";
      }
    });
  }
});
=======
// public/nav.js
(function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Highlight current page
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  const navLinks = document.querySelector(".nav-links");
  const loginBtn = document.getElementById("nav-login");
  const logoutBtn = document.getElementById("nav-logout");

  if (!navLinks) return;

  // Load user session
  fetch("/me")
    .then(r => r.json())
    .then(user => {
      // Remove any previously injected dashboard links
      navLinks.querySelectorAll("[data-dashboard-link]").forEach(el => el.remove());

      // If user is logged in
      if (user && user.role) {
        // Determine dashboard label + link
        let dashboardText = "";
        let dashboardHref = "";

        if (user.role === "student") {
          dashboardText = "Student Dashboard";
          dashboardHref = "/student-dashboard";
        } else if (user.role === "teacher") {
          dashboardText = "Teacher Dashboard";
          dashboardHref = "/teacher-dashboard";
        }

        // Inject dashboard link
        if (dashboardText && dashboardHref) {
          const li = document.createElement("li");
          const a = document.createElement("a");

          a.href = dashboardHref;
          a.textContent = dashboardText;

          // Highlight active dashboard tab
          if (currentPage.includes("dashboard")) {
            a.classList.add("active");
          }

          li.setAttribute("data-dashboard-link", "true");
          li.appendChild(a);
          navLinks.appendChild(li);
        }

        // Toggle login/logout visibility
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "";
      }

      // If user is logged out
      else {
        if (loginBtn) loginBtn.style.display = "";
        if (logoutBtn) logoutBtn.style.display = "none";
      }
    })
    .catch(() => {});
})();
>>>>>>> c4c6edefbfff1aaa66cb54856c99624f80521d35
