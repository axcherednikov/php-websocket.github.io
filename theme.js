(function () {
  "use strict";

  const storageKey = "php-websocket-theme";
  const toggle = document.querySelector("[data-theme-toggle]");
  const label = document.querySelector("[data-theme-toggle-label]");
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      const theme = localStorage.getItem(storageKey);
      return theme === "light" || theme === "dark" ? theme : null;
    } catch (error) {
      return null;
    }
  }

  function currentTheme() {
    return storedTheme() || (media.matches ? "dark" : "light");
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
    }
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    if (!toggle || !label) {
      return;
    }

    const isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    label.textContent = isDark ? "Light" : "Dark";
  }

  applyTheme(currentTheme());

  if (toggle) {
    toggle.addEventListener("click", () => {
      const nextTheme = currentTheme() === "dark" ? "light" : "dark";
      setStoredTheme(nextTheme);
      applyTheme(nextTheme);
    });
  }

  media.addEventListener("change", () => {
    if (!storedTheme()) {
      applyTheme(currentTheme());
    }
  });
}());
