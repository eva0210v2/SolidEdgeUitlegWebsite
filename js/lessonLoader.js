// ✅ lessonLoader.js — laadt lessen uit manifest + HTML bestanden
let manifest = [];

async function loadManifest() {
  try {
    const response = await fetch("functies/manifest.json");
    manifest = await response.json();
    console.log("✅ Manifest geladen:", manifest);
  } catch (err) {
    console.error("❌ Fout bij laden manifest:", err);
  }
}

async function loadAllLessons() {
  if (!manifest.length) await loadManifest();

  const container = document.getElementById("lesson-container");
  if (!container) return;

  const lessons = [];
  const lessonNames = [];

  for (const item of manifest) {
    try {
      const response = await fetch(`functies/${item.name}.html`);
      if (!response.ok) throw new Error("Bestand niet gevonden");

      const html = await response.text();
      const lessonHTML = `
        <div class="lesson expandable" data-lesson="${item.name}" data-level="${item.level.toLowerCase()}">
          <div class="lesson-header">
            <span class="lesson-title">${item.title}</span>
            <div class="lesson-controls">
              <span class="lesson-level ${item.level.toLowerCase()}">${item.level}</span>
              <span class="toggle-icon">▼</span>
            </div>
          </div>
          <div class="lesson-content">
            ${html}
          </div>
        </div>
      `;
      lessons.push(lessonHTML);
      lessonNames.push(item.name);
    } catch (err) {
      console.error(`❌ Fout bij laden ${item.name}:`, err);
    }
  }

  container.innerHTML = lessons.join("");
  setupExpandableListeners();

  // Dispatch event voor search.js
  document.dispatchEvent(new CustomEvent("lessonsReady", {
    detail: { lessons: lessonNames }
  }));

  // Als er vóór het laden van de uitleg een zoekactie vroeg om een lesson,
  // highlight die nu kort nadat DOM is opgebouwd.
  if (window.pendingSearchLesson) {
    const pending = window.pendingSearchLesson;
    // kleine delay zodat DOM-animaties kunnen initialiseren
    setTimeout(() => {
      try { highlightLesson(pending); } catch (err) { console.warn("highlight pending failed:", err); }
      window.pendingSearchLesson = null;
    }, 50);
  }

  console.log("✅ Alle lessen geladen en expand-listeners ingesteld");
}

function setupExpandableListeners() {
  const expandables = document.querySelectorAll(".lesson.expandable");

  expandables.forEach((lesson) => {
    const header = lesson.querySelector(".lesson-header");
    if (header) {
      header.addEventListener("click", () => {
        lesson.classList.toggle("open");
      });
    }
  });
}

/**
 * Highlight a lesson.
 * Accepts either a lesson id (string) or a DOM element.
 */
function highlightLesson(lessonIdOrElement) {
  const lesson = (typeof lessonIdOrElement === "string")
    ? document.querySelector(`[data-lesson="${lessonIdOrElement}"]`)
    : lessonIdOrElement;

  if (!lesson) return;

  // Verwijder eerdere highlights
  document.querySelectorAll(".lesson.highlight").forEach(el => el.classList.remove("highlight"));

  // Sluit andere open lessons
  document.querySelectorAll(".lesson.expandable.open").forEach(el => el.classList.remove("open"));

  // Open de gewenste lesson
  lesson.classList.add("open");

  // Scroll naar de lesson
  lesson.scrollIntoView({ behavior: "smooth", block: "start" });

  // Highlight effect (tijdelijk)
  lesson.classList.add("highlight");
  setTimeout(() => lesson.classList.remove("highlight"), 3000);
}

// Initialisatie en expose functies voor andere scripts
window.loadAllLessons = loadAllLessons;
window.highlightLesson = highlightLesson;
loadManifest();