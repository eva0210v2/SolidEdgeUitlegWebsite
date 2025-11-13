console.log("🚀 lessonLoader.js geladen");

async function loadAllLessons() {
  const container = document.getElementById("lesson-container");
  if (!container) {
    console.warn("⚠️ Geen #lesson-container gevonden.");
    return;
  }

  console.log("🧱 Start met laden van lessen...");
  container.innerHTML = ""; // eerst leegmaken

  const loadingMsg = document.createElement("div");
  loadingMsg.id = "lesson-loading";
  loadingMsg.textContent = "⏳ Lessen worden geladen...";
  container.appendChild(loadingMsg);

  try {
    const manifestRes = await fetch("./functies/manifest.json");
    if (!manifestRes.ok) throw new Error("Kon manifest.json niet laden");

    const lessons = await manifestRes.json();
    const lessonElements = [];

    for (const lesson of lessons) {
      try {
        const safeName = lesson.name.replace(/\s+/g, "").toLowerCase();
        const response = await fetch(`./functies/${safeName}.html`);
        if (!response.ok) throw new Error(`Bestand niet gevonden: ${safeName}`);

        const html = await response.text();
        const temp = document.createElement("div");
        temp.innerHTML = html.trim();
        let lessonEl = temp.querySelector(".lesson");

        if (lessonEl) {
          lessonEl.classList.add("expandable");
          lessonEl.dataset.level = lesson.level || "onbekend";
          lessonEl.setAttribute("data-lesson", safeName);
        } else {
          const wrapper = document.createElement("div");
          wrapper.classList.add("lesson", "expandable");
          wrapper.dataset.level = lesson.level || "onbekend";
          wrapper.setAttribute("data-lesson", safeName);
          wrapper.innerHTML = `
            <div class="lesson-header">
              <div class="lesson-title">${lesson.title || safeName}</div>
              <div class="lesson-controls">
                <span class="lesson-level ${lesson.level?.toLowerCase() || ""}">${lesson.level || ""}</span>
                <span class="toggle-icon">▼</span>
              </div>
            </div>
            <div class="lesson-content">${html}</div>
          `;
          lessonEl = wrapper;
        }

        // toggle click
        const header = lessonEl.querySelector(".lesson-header");
        if (header) {
          header.addEventListener("click", e => {
            if (lessonEl.classList.contains("search-locked")) return;
            lessonEl.classList.toggle("open");
          });
        }

        container.appendChild(lessonEl);
        lessonElements.push(lessonEl);

      } catch (err) {
        console.error(`❌ Kon les "${lesson.name}" niet laden:`, err);
      }
    }

    // ✅ Verwijder loading message
    loadingMsg.remove();

    // ✅ Dispatch lessonsReady event + handshake
    const lessonNames = lessonElements.map(el => el.dataset.lesson);
    document.dispatchEvent(new CustomEvent("lessonsReady", {
      detail: { total: lessonElements.length, lessons: lessonNames }
    }));

    if (window._lessonLoaderHandshakeResolve) {
      window._lessonLoaderHandshakeResolve("ready");
      window._lessonLoaderHandshakeResolve = null;
    }

    console.log("✅ Alle lessen geladen — lessonsReady event + handshake verzonden");

  } catch (err) {
    console.error("❌ Kon manifest.json niet laden:", err);
  }
}

// Globaal beschikbaar
window.loadAllLessons = loadAllLessons;
