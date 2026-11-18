/* Copy-email buttons: <button data-copy="address">. Falls back to doing nothing if the clipboard is blocked. */
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-copy]");
  if (!b || !navigator.clipboard) return;
  navigator.clipboard.writeText(b.getAttribute("data-copy")).then(function () {
    var old = b.textContent;
    b.textContent = "Copied ✓";
    setTimeout(function () { b.textContent = old; }, 1600);
  }).catch(function () {});
});
