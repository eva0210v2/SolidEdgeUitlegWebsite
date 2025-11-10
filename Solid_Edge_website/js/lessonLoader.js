console.log("🚀 lessonLoader.js geladen");

async function loadAllLessons() {
  const container = document.getElementById("lesson-container");
  if (!container) {
    console.warn("⚠️ Geen #lesson-container gevonden.");
    return;
  }

  container.innerHTML = ""; // eerst leegmaken

  try {
    // 1️⃣ manifest ophalen met alle lessen
    const manifestRes = await fetch("../functies/manifest.json");
    if (!manifestRes.ok) throw new Error("Kon manifest.json niet laden");

    const lessons = await manifestRes.json();

    // 2️⃣ door alle lessen loopen
    for (const lesson of lessons) {
  try {
    const response = await fetch(`../functies/${lesson.name}.html`);
    if (!response.ok) throw new Error(`Bestand niet gevonden: ${lesson.name}`);

    const html = await response.text();

    // 🧱 wrapper maken + HTML opbouwen
    const wrapper = document.createElement("div");
    wrapper.classList.add("lesson");
    wrapper.dataset.level = lesson.level;
    wrapper.setAttribute("data-lesson", lesson.name);


    // 📦 nieuwe structuur met header, label en content
    const lessonHTML = `
      <div class="lesson-header">
        <div class="lesson-title">${lesson.title || lesson.name}</div>
        <div class="lesson-controls">
          <span class="lesson-level ${lesson.level.toLowerCase()}">${lesson.level}</span>
          <span class="toggle-icon">▼</span>
        </div>
      </div>
      <div class="lesson-content">
        ${html}
      </div>
    `;
    wrapper.classList.add("expandable");
    wrapper.innerHTML = lessonHTML;
    container.appendChild(wrapper);

    // 🎯 Klik functionaliteit: open/dicht
    const header = wrapper.querySelector(".lesson-header");
    header.addEventListener("click", () => {
      wrapper.classList.toggle("open");
    });

  } catch (err) {
    console.error(`❌ Kon ${lesson.name} niet laden:`, err);
  }
}


    console.log("✅ Alle lessen geladen");
  } catch (err) {
    console.error("❌ Kon manifest.json niet laden:", err);
  }
}
