// ✅ script.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Website geladen ✅");

  // Document title
  if (window.SITE) {
    document.title = `${SITE.siteName} | ${SITE.slogan}`;
  }

  // Vul automatisch alle elementen met data-text
  document.querySelectorAll("[data-text]").forEach(el => {
    const key = el.getAttribute("data-text");
    if (window.SITE && SITE[key]) {
      el.textContent = SITE[key];
    } else {
      console.warn(`⚠️ Geen waarde gevonden voor ${key}`);
    }
  });
});
