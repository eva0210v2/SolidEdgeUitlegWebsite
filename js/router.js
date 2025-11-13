// ✅ router.js — router + lessonLoader handshake + actieve tab fix
const content = document.getElementById("content");

// Globale listener voor lessonLoader + pending search
async function handleLessonLoader() {
  const currentPage = window.currentPage || "home";
  if (currentPage === "uitleg" && typeof window.loadAllLessons === "function") {
    await window.loadAllLessons();
    if (window.pendingSearchLesson) {
      highlightLesson(window.pendingSearchLesson);
      window.pendingSearchLesson = null;
    }
  }
}
document.addEventListener("contentUpdated", handleLessonLoader);

// Pagina laden
async function loadPage(page) {
  window.currentPage = page; // belangrijk voor listener
  const path = page === "home" ? "pages/home.html" : `pages/${page}.html`;

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Niet gevonden");

    const html = await response.text();
    const temp = document.createElement("div");
    temp.innerHTML = html;

    const main = temp.querySelector("main");
    content.innerHTML = main ? main.outerHTML : html;

    // Event: content in DOM gezet
    document.dispatchEvent(new Event("contentUpdated"));

    // Active tab updaten
    setActiveTab(page);

    // Zoekbalk alleen tonen op uitleg pagina
    const searchSection = document.querySelector(".search-section");
    if (page === "uitleg") {
      searchSection?.classList.add("visible");
    } else {
      searchSection?.classList.remove("visible");
    }

    // History pushState
    window.history.pushState({ page }, "", `#${page}`);

    // Handshake klaarzetten (voor lessonLoader)
    if (!window.lessonLoaderHandshake) {
      window.lessonLoaderHandshake = new Promise(resolve => {
        window._lessonLoaderHandshakeResolve = resolve;
      });
      console.log("🤝 Handshake voorbereid in router.js");
    }

  } catch (err) {
    console.error("❌ Fout bij laden pagina:", err);
    content.innerHTML = "<main><h2>404 - Pagina niet gevonden</h2></main>";
  }
}

// Active tab
function setActiveTab(page) {
  const links = document.querySelectorAll(".nav-tabs a");
  links.forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

// Navigatie koppelen
function setupNavLinks() {
  const links = document.querySelectorAll(".nav-tabs a");
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = e.target.dataset.page;
      if (!page) return;
      loadPage(page);
    });
  });
}

// Browser terugknop
window.addEventListener("popstate", e => {
  const page = e.state?.page || "home";
  loadPage(page);
});

// Initialisatie
setupNavLinks();
const startPage = location.hash.replace("#", "") || "home";
loadPage(startPage);

// Globaal beschikbaar
window.loadPage = loadPage;
window.setActiveTab = setActiveTab;
