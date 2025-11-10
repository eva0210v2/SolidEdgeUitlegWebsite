// ✅ router.js — finale versie met lesloader-integratie + actieve tabfix + contentUpdated event

const content = document.getElementById("content");

// 🔹 Pagina laden
async function loadPage(page) {
  const path = page === "home" ? "pages/home.html" : `pages/${page}.html`;

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Niet gevonden");

    const html = await response.text();
    const temp = document.createElement("div");
    temp.innerHTML = html;

    const main = temp.querySelector("main");
    content.innerHTML = main ? main.outerHTML : html;

    // ✅ Event uitsturen zodra nieuwe content in de DOM staat
    document.dispatchEvent(new Event('contentUpdated'));

    // ✅ Active tab bijwerken
    setActiveTab(page);

    // 🧠 Als we naar de uitlegpagina gaan → laad lessonLoader
    if (page === "uitleg") {
      console.log("📘 uitlegpagina gedetecteerd — laad lessonLoader via window.loadAllLessons");

      // Als script al geladen is, roep functie direct aan
      if (window.loadAllLessons && typeof window.loadAllLessons === "function") {
        window.loadAllLessons();
      } else {
        // Anders laad script dynamisch
        const existing = document.querySelector('script[data-loader="lesson"]');
        if (existing) {
          existing.addEventListener("load", () => {
            if (window.loadAllLessons) window.loadAllLessons();
          });
        } else {
          const script = document.createElement("script");
          script.src = "/js/lessonLoader.js"; // absoluut pad!
          script.setAttribute("data-loader", "lesson");
          script.onload = () => {
            console.log("📘 lessonLoader.js dynamisch geladen");
            if (window.loadAllLessons) window.loadAllLessons();
          };
          script.onerror = (e) => console.error("❌ kon lessonLoader niet dynamisch laden:", e);
          document.body.appendChild(script);
        }
      }
    }
  } catch (err) {
    console.error("❌ fout bij laden pagina:", err);
    content.innerHTML = "<main><h2>404 - Pagina niet gevonden</h2></main>";
  }
}

// 🔹 Functie om actieve tab bij te werken
function setActiveTab(page) {
  const links = document.querySelectorAll('.nav-tabs a');
  links.forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

// 🔹 Navigatie koppelen
function setupNavLinks() {
  const links = document.querySelectorAll(".nav-tabs a");

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = e.target.getAttribute("data-page");
      if (!page) return;

      // ✅ Active tab updaten
      setActiveTab(page);

      // ✅ URL bijwerken
      window.history.pushState({ page }, "", `#${page}`);

      // ✅ Pagina laden
      loadPage(page);
    });
  });
}

// 🔹 Browser terugknop
window.addEventListener("popstate", e => {
  const page = e.state?.page || "home";
  loadPage(page);
  setActiveTab(page);
});

// 🔹 Initialisatie
setupNavLinks();
const startPage = location.hash.replace("#", "") || "home";
loadPage(startPage);
setActiveTab(startPage);

// ✅ Globaal beschikbaar maken voor andere scripts
window.loadPage = loadPage;
window.setActiveTab = setActiveTab;
