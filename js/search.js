console.log("🚀 search.js geladen");

let lessonsLoadedFlag = false;
let loadedLessonNames = [];

document.addEventListener("lessonsReady", (e) => {
  lessonsLoadedFlag = true;
  loadedLessonNames = e.detail.lessons || [];
  console.log("✅ Lessen geladen:", loadedLessonNames);
});

// Wacht tot lesson daadwerkelijk in de DOM staat
function waitForLessonInDOM(lessonName, timeout = 5000) {
  return new Promise(resolve => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(`[data-lesson='${lessonName}']`);
      if (el) {
        resolve(el);
      } else if (Date.now() - start < timeout) {
        requestAnimationFrame(check);
      } else {
        resolve(null);
      }
    };
    check();
  });
}

function waitForLessonsReady(lessonName) {
  return new Promise(resolve => {
    if (document.querySelector(`[data-lesson='${lessonName}']`)) {
      resolve();
      return;
    }

    if (lessonsLoadedFlag && loadedLessonNames.includes(lessonName)) {
      resolve();
      return;
    }

    function onReady(e) {
      if (e.detail.lessons.includes(lessonName)) {
        document.removeEventListener("lessonsReady", onReady);
        resolve();
      }
    }
    document.addEventListener("lessonsReady", onReady);

    setTimeout(() => {
      document.removeEventListener("lessonsReady", onReady);
      resolve();
    }, 5000);
  });
}

async function searchSite(force = false) {
  const input = document.getElementById("search");
  const term = input.value.trim().toLowerCase();

  if (!term) return;

  let lessons = [];
  try {
    const res = await fetch("./functies/manifest.json");
    if (res.ok) lessons = await res.json();
  } catch (err) {
    console.error("❌ Kon manifest niet laden:", err);
    return;
  }

  const match = lessons.find(
    l => l.name.toLowerCase() === term || l.title.toLowerCase() === term
  );

  if (!match) {
    alert("Geen resultaten gevonden 😕");
    return;
  }

  const lessonName = match.name;
  window.pendingSearchLesson = lessonName;

  if (typeof loadPage === "function") {
    await loadPage("uitleg");
  }

  await waitForLessonsReady(lessonName);

  // Wacht nu ook tot element in DOM staat
  const lessonEl = await waitForLessonInDOM(lessonName);
  if (!lessonEl) {
    console.warn("Lesson DOM element niet gevonden:", lessonName);
    return;
  }

  highlightLesson(lessonEl);

  window.pendingSearchLesson = null;
}

// Highlight nu element zelf
function highlightLesson(target) {
  if (!target) return;

  if (target.classList.contains("search-locked")) return;

  document.querySelectorAll(".lesson.expandable.open")
    .forEach(el => el.classList.remove("open"));

  target.classList.add("open");

  // Wacht tot max-height animatie klaar is
  setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("highlight");
    setTimeout(() => target.classList.remove("highlight"), 3000);
  }, 410);
}

// Enter key search
document.getElementById("search")?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchSite(true);
  }
});

// Suggesties
const searchInput = document.getElementById("search");
const suggestionBox = document.getElementById("search-suggestions");

if (searchInput && suggestionBox) {
  searchInput.addEventListener("input", async e => {
    const term = e.target.value.trim().toLowerCase();

    if (!term) {
      suggestionBox.style.display = "none";
      suggestionBox.innerHTML = "";
      return;
    }

    const res = await fetch("./functies/manifest.json");
    const data = await res.json();

    const matches = data.filter(
      l => l.title.toLowerCase().includes(term) || l.name.toLowerCase().includes(term)
    );

    suggestionBox.innerHTML = matches.map(
      m => `<li data-lesson="${m.name}">${m.title}</li>`
    ).join("");

    suggestionBox.style.display = matches.length ? "block" : "none";

    suggestionBox.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", () => {
        searchInput.value = li.textContent;
        suggestionBox.style.display = "none";
        searchSite(true);
      });
    });
  });
}

window.searchSite = searchSite;
