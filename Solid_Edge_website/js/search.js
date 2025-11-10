// --- search.js ---
// Zoekt over de hele site en werkt ook vanaf Home

async function searchSite() {
  const input = document.getElementById("search");
  const term = input.value.trim().toLowerCase();
  if (!term) return;

  // 🔹 1️⃣ manifest.json ophalen
  let lessons = [];
  try {
    const res = await fetch("functies/manifest.json");
    if (res.ok) lessons = await res.json();
  } catch (err) {
    console.error("❌ Kon manifest niet laden:", err);
  }

  // 🔹 2️⃣ matchen met title of name
  const match = lessons.find(
    (l) =>
      l.name.toLowerCase().includes(term) ||
      (l.title && l.title.toLowerCase().includes(term))
  );

  if (!match) {
    alert("Geen resultaten gevonden 😕");
    return;
  }

  // 🔹 3️⃣ Onthoud welke les we willen highlighten
  window.pendingSearchLesson = match.name;

  // 🔹 4️⃣ Navigeer naar uitlegpagina (ook als we nog niet daar zijn)
  console.log(`📘 Ga naar uitlegpagina voor: ${match.name}`);
  window.history.pushState({ page: "uitleg" }, "", "#uitleg");

  // ✅ Gebruik loadPage en setActiveTab van router.js (globaal beschikbaar)
  if (typeof loadPage === "function") {
    await loadPage("uitleg");
  }
  if (typeof setActiveTab === "function") {
    setActiveTab("uitleg");
  }

  // 🔹 5️⃣ Wacht tot de juiste les geladen is, dan highlighten
  waitForLessonToLoad(match.name);
}

// 🔹 Wacht tot de les verschijnt in de DOM
function waitForLessonToLoad(lessonName) {
  const checkInterval = setInterval(() => {
    const target = document.querySelector(`[data-lesson='${lessonName}']`);
    if (target) {
      clearInterval(checkInterval);

      // Expandeer de les (als expandable)
      target.classList.add("open");

      // Scroll netjes naar de juiste positie
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight geel
      target.classList.add("highlight");
      setTimeout(() => target.classList.remove("highlight"), 2500);
    }
  }, 400);
}

// 🔹 Enter activeert zoeken
document.getElementById("search").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchSite();
  }
});

// 🔹 Event: als de uitlegpagina opnieuw geladen is en er stond een pending search
document.addEventListener("lessonLoaderReady", () => {
  if (window.pendingSearchLesson) {
    waitForLessonToLoad(window.pendingSearchLesson);
    window.pendingSearchLesson = null;
  }
});
