const DEFAULT_LOCALE = "en-US";
const SUPPORTED_LOCALES = ["en-US", "es-419"];

function getSavedLocale() {
  const savedLocale = window.localStorage.getItem("coldtrace-locale");
  return SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : DEFAULT_LOCALE;
}

function resolveTranslation(translations, key) {
  return key.split(".").reduce((current, part) => current?.[part], translations);
}

async function loadTranslations(locale) {
  const response = await fetch(`assets/locales/${locale}.json`);
  if (!response.ok) {
    throw new Error(`Unable to load locale: ${locale}`);
  }

  return response.json();
}

function applyTranslations(translations) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const value = resolveTranslation(translations, key);

    if (typeof value === "string") {
      element.textContent = value;
    }
  });
}

function updateLocaleButtons(locale) {
  document.querySelectorAll("[data-locale-option]").forEach((button) => {
    const isActive = button.getAttribute("data-locale-option") === locale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

async function setLocale(locale) {
  const nextLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const translations = await loadTranslations(nextLocale);

  applyTranslations(translations);
  updateLocaleButtons(nextLocale);
  document.documentElement.lang = nextLocale;
  window.localStorage.setItem("coldtrace-locale", nextLocale);
}

window.ColdTraceI18n = {
  setLocale,
  getSavedLocale,
};
