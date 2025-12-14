document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Invalid credentials");
          return;
        }

        const data = await res.json();
        window.location.href = data.redirect || "index.html";

      } catch {
        alert("Network error during login");
      }
    });
  }
});
