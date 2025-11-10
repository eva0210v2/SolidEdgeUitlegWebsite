// ✅ filter.js — alleen verantwoordelijk voor tonen/verbergen van lessen
(function () {

  // Hulp: pas filter toe op basis van huidige selectie
  function applyFilter(selected) {
    const items = document.querySelectorAll("[data-level]");
    const sel = (selected || "all").toLowerCase();

    items.forEach((el) => {
      const level = (el.getAttribute("data-level") || "").toLowerCase();
      el.style.display = (sel === "all" || sel === level) ? "" : "none";
    });
  }

  // 1️⃣ Filter op dropdown change (werkt ook na router-load)
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches("#levelFilter")) {
      applyFilter(e.target.value);
    }
  });

  // 2️⃣ Herstel filter na content-wijziging (door router.js)
  const content = document.getElementById("content");
  if (content) {
    const mo = new MutationObserver(() => {
      const select = document.getElementById("levelFilter");
      if (select) {
        applyFilter(select.value || "all");
      }
    });
    mo.observe(content, { childList: true, subtree: true });
  }

  // 3️⃣ Eerste keer toepassen
  window.addEventListener("load", () => {
    const select = document.getElementById("levelFilter");
    if (select) applyFilter(select.value || "all");
  });

})();
