/* Light/dark toggle. Loads in <head> so the saved theme applies before the page paints. */
(function () {
  var root = document.documentElement, saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function current() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  window.toggleTheme = function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    document.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };
  window.currentTheme = current;
})();
