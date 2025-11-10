// Zoekt over de hele site, ook vanaf Home, met highlight + smooth scroll

async function searchSite(force = false) {
  const input = document.getElementById("search");
  const term = input.value.trim().toLowerCase();
  if (!term) return;

  // 🔹 voorkomen dat dezelfde zoekterm wordt genegeerd
  if (!force && window.lastSearchTerm === term) {
    console.log("🔁 Zelfde zoekterm — geforceerd opnieuw zoeken");
  }
  window.lastSearchTerm = term;

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

  // 🔹 4️⃣ Navigeer naar uitlegpagina
  console.log(`📘 Ga naar uitlegpagina voor: ${match.name}`);
  window.history.pushState({ page: "uitleg" }, "", "#uitleg");

  if (typeof loadPage === "function") {
    await loadPage("uitleg");
  }
  if (typeof setActiveTab === "function") {
    setActiveTab("uitleg");
  }

  // 🔹 5️⃣ Wacht tot de juiste les geladen is, dan highlighten + scrollen
  waitForLessonToLoad(match.name);
}

// 🔹 Wacht tot de les verschijnt in de DOM, dan openen + scrollen + highlight
function waitForLessonToLoad(lessonName) {
  const checkInterval = setInterval(() => {
    const target = document.querySelector(`[data-lesson='${lessonName}']`);
    if (target) {
      clearInterval(checkInterval);

      // Expandeer de les (als expandable)
      target.classList.add("open");

      // Scroll soepel naar de juiste positie
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight geel
      target.classList.add("highlight");
      setTimeout(() => target.classList.remove("highlight"), 2500);
    }
  }, 400);
}

// 🔹 Enter activeert zoeken (ook bij dezelfde term)
document.getElementById("search").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchSite(true);
  }
});

// 🔹 Als de uitlegpagina opnieuw geladen wordt en er is een pending search
document.addEventListener("lessonLoaderReady", () => {
  if (window.pendingSearchLesson) {
    waitForLessonToLoad(window.pendingSearchLesson);
    window.pendingSearchLesson = null;
  }
});