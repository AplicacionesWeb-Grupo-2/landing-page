document.addEventListener("DOMContentLoaded", () => {
  window.ColdTraceI18n.setLocale(window.ColdTraceI18n.getSavedLocale());

  document.querySelectorAll("[data-locale-option]").forEach((button) => {
    button.addEventListener("click", () => {
      window.ColdTraceI18n.setLocale(button.getAttribute("data-locale-option"));
    });
  });
});
