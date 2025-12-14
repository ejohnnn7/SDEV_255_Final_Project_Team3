// public/nav.js
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelector(".nav-links");
  const loginBtn = document.getElementById("nav-login");
  const logoutBtn = document.getElementById("nav-logout");
  const heroSignup = document.getElementById("hero-signup");

  // Highlight current page
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  // Load user session
  fetch("/me")
    .then(res => res.json())
    .then(user => {
      const loggedIn = user && user.email;

      // Toggle login/logout buttons
      if (loginBtn) loginBtn.style.display = loggedIn ? "none" : "inline-block";
      if (logoutBtn) logoutBtn.style.display = loggedIn ? "inline-block" : "none";
      if (heroSignup) heroSignup.style.display = loggedIn ? "none" : "inline-block";

      if (navLinks) {
        // Remove any previously injected dashboard links
        navLinks.querySelectorAll("[data-dashboard-link]").forEach(el => el.remove());

        if (loggedIn) {
          let dashboardText = "";
          let dashboardHref = "";

          if (user.role === "student") {
            dashboardText = "Student Dashboard";
            dashboardHref = "/student-dashboard.html";
          } else if (user.role === "teacher") {
            dashboardText = "Teacher Dashboard";
            dashboardHref = "/teacher-dashboard.html";
          }

          if (dashboardText && dashboardHref) {
            const li = document.createElement("li");
            li.setAttribute("data-dashboard-link", "true");
            const a = document.createElement("a");
            a.href = dashboardHref;
            a.textContent = dashboardText;
            if (currentPage.includes("dashboard")) a.classList.add("active");
            li.appendChild(a);
            navLinks.appendChild(li);
          }
        }
      }
    })
    .catch(() => {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (heroSignup) heroSignup.style.display = "inline-block";
    });

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/logout", { method: "POST", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        window.location.href = data.redirect || "login.html";
      } catch {
        window.location.href = "login.html";
      }
    });
  }
});
