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
