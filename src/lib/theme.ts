export const THEME_STORAGE_KEY = "theme";

/**
 * Inline, render-blocking script for <head>: applies the saved theme (or the OS
 * preference) before first paint so there is no flash of the wrong theme.
 * Kept in a plain (non-client) module so the server layout can inline the string.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;
