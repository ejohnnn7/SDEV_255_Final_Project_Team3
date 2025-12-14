let __allCourses = [];

function renderCourses(list) {
  const container = document.getElementById("coursesGrid");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<p style="color:#555;">No courses found.</p>`;
    return;
  }

  container.innerHTML = list
    .map(
      (c) => `
    <div class="course-card">
      <h3>${c.number} — ${c.name}</h3>
      <p>${c.description}</p>
      <p><strong>Subject:</strong> ${c.subject}</p>
      <p><strong>Credits:</strong> ${c.credits}</p>
    </div>
  `
    )
    .join("");
}

function loadCourses() {
  fetch("/courses-list")
    .then((res) => res.json())
    .then((data) => {
      __allCourses = data || [];
      renderCourses(__allCourses);
    })
    .catch(() => {
      const container = document.getElementById("coursesGrid");
      if (container) {
        container.innerHTML =
          `<p style="color:#b33;">Error loading courses.</p>`;
      }
    });
}

function searchCourses() {
  const name = document.getElementById("searchName").value.trim().toLowerCase();
  const number = document.getElementById("searchNumber").value.trim().toLowerCase();
  const subject = document.getElementById("filterSubject").value.trim().toLowerCase();

  const filtered = __allCourses.filter((c) => {
    const byName = name ? c.name.toLowerCase().includes(name) : true;
    const byNumber = number ? String(c.number).toLowerCase().includes(number) : true;
    const bySubject = subject ? c.subject.toLowerCase() === subject : true;
    return byName && byNumber && bySubject;
  });

  renderCourses(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchBtn")?.addEventListener("click", searchCourses);
  loadCourses();
});
