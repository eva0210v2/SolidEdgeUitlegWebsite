console.log("🚀 search.js geladen");

let lessonsLoadedFlag = false;
let loadedLessonNames = [];

document.addEventListener("lessonsReady", (e) => {
  lessonsLoadedFlag = true;
  loadedLessonNames = e.detail.lessons || [];
  console.log("✅ Lessen geladen:", loadedLessonNames);
});

function waitForLessonInDOM(lessonName, timeout = 5000) {
  return new Promise(resolve => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(`#lesson-container .lesson[data-lesson="${lessonName}"]`);
      if (el) return resolve(el);
      if (Date.now() - start > timeout) return resolve(null);
      setTimeout(check, 100);
    };
    check();
  });
}

function waitForLessonsReady() {
  return new Promise(resolve => {
    if (lessonsLoadedFlag) return resolve();
    document.addEventListener("lessonsReady", () => resolve(), { once: true });
  });
}

async function searchSite(force = false) {
  const input = document.getElementById("search");
  if (!input) return;
  const term = input.value.trim().toLowerCase();
  if (!term) return;

  console.log("🔍 Zoeken naar:", term);

  let manifest = [];
  try {
    const resp = await fetch("functies/manifest.json");
    manifest = await resp.json();
  } catch (err) {
    console.warn("Kon manifest niet laden:", err);
  }

  const match = manifest.find(
    l => l.name.toLowerCase() === term
      || l.title.toLowerCase() === term
      || l.name.toLowerCase().includes(term)
      || l.title.toLowerCase().includes(term)
  );

  if (!match) {
    console.log("Geen match gevonden voor:", term);
    return;
  }

  console.log("✅ Match gevonden:", match);
  const lessonName = match.name;

  const currentPage = window.currentPage || window.location.hash.replace("#", "") || "home";

  if (currentPage !== "uitleg") {
    window.pendingSearchLesson = lessonName;
    window.location.hash = "uitleg";
    return;
  }

  await waitForLessonsReady();
  const lessonEl = await waitForLessonInDOM(lessonName, 7000);
  if (!lessonEl) {
    console.warn("❌ Lesson DOM element niet gevonden:", lessonName);
    return;
  }

  console.log("✅ Lesson element gevonden, highlighting...");

  if (typeof window.highlightLesson === "function") {
    try {
      window.highlightLesson(lessonName);
    } catch (err) {
      console.warn("window.highlightLesson faalde, fallback:", err);
      localHighlightFallback(lessonEl);
    }
  } else {
    localHighlightFallback(lessonEl);
  }

  window.pendingSearchLesson = null;
}

function localHighlightFallback(target) {
  const el = (typeof target === "string")
    ? document.querySelector(`#lesson-container .lesson[data-lesson="${target}"]`)
    : target;
  if (!el) return;
  if (el.classList.contains("search-locked")) return;

  document.querySelectorAll("#lesson-container .lesson.expandable.open").forEach(e => e.classList.remove("open"));
  el.classList.add("open");

  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight");
    setTimeout(() => el.classList.remove("highlight"), 3000);
  }, 410);
}

document.getElementById("search")?.addEventListener("keydown", e => {
  if (e.key === "Enter") searchSite();
});

const searchInput = document.getElementById("search");
const suggestionBox = document.getElementById("search-suggestions");

// Ensure suggestionBox exists and is initially hidden
if (suggestionBox) {
  suggestionBox.style.display = "none";
  suggestionBox.classList.add("search-suggestions");
}

if (searchInput && suggestionBox) {
  searchInput.addEventListener("input", async e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
      return;
    }

    try {
      const resp = await fetch("functies/manifest.json");
      const manifest = await resp.json();
      const suggestions = manifest
        .filter(m => m.title.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
        .slice(0, 6);

      if (suggestions.length === 0) {
        suggestionBox.innerHTML = `<div class="no-suggestion">Geen resultaten</div>`;
        suggestionBox.style.display = "block";
        return;
      }

      suggestionBox.innerHTML = suggestions
        .map(s => `<div class="suggestion" data-name="${s.name}" tabindex="0">${s.title}</div>`)
        .join("");
      suggestionBox.style.display = "block";
    } catch (err) {
      console.warn("Suggesties laden mislukt:", err);
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
    }
  });

  // Use event delegation for clicks and keyboard selection
  suggestionBox.addEventListener("click", (ev) => {
    const el = ev.target.closest(".suggestion");
    if (!el) return;
    const name = el.getAttribute("data-name");
    if (!name) return;
    searchInput.value = el.textContent;
    window.pendingSearchLesson = name;
    const currentPage = window.currentPage || window.location.hash.replace("#", "") || "home";
    if (currentPage !== "uitleg") {
      window.location.hash = "uitleg";
    } else {
      searchSite();
    }
    suggestionBox.style.display = "none";
  });

  suggestionBox.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      const el = document.activeElement;
      if (el && el.classList.contains("suggestion")) {
        el.click();
      }
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (ev) => {
    if (!searchInput.contains(ev.target) && !suggestionBox.contains(ev.target)) {
      suggestionBox.style.display = "none";
    }
  });

  // Optional: show suggestions again on focus if there is input
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() && suggestionBox.innerHTML.trim()) {
      suggestionBox.style.display = "block";
    }
  });
}

window.searchSite = searchSite;