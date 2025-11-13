// ✅ filter.js — alleen verantwoordelijk voor tonen/verbergen van lessen
(function () {

  function applyFilter(selected) {
    const items = document.querySelectorAll("[data-level]");
    const sel = (selected || "all").toLowerCase();

    items.forEach((el) => {
      const level = (el.getAttribute("data-level") || "").toLowerCase();
      el.style.display = (sel === "all" || sel === level) ? "" : "none";
    });
  }

  // Filter op dropdown change
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches("#levelFilter")) {
      applyFilter(e.target.value);
    }
  });

  // Herstel filter na content-wijziging
  document.addEventListener("contentUpdated", () => {
    const select = document.getElementById("levelFilter");
    if (select) {
      applyFilter(select.value || "all");
    }
  });

  // Eerste keer toepassen
  window.addEventListener("load", () => {
    const select = document.getElementById("levelFilter");
    if (select) applyFilter(select.value || "all");
  });

})();
