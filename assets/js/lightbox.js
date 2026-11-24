/* Click-to-enlarge for images on project pages.
   Every content image inside <main> opens in a dimmed overlay and grows out of its spot on the page.
   Skipped: images inside links to other pages (project cards), logos ("logo" in the file name), and anything with data-no-zoom.
   An image wrapped in a link to an image file opens that file (use this for a higher-resolution version).
   Closes on click, Escape, or the close button. Visitors who ask for less motion get a simple fade. */
(function () {
  var IMG_FILE = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i;
  var MARGIN = 0.04;     // gap around the enlarged image, as a fraction of the viewport
  var DURATION = 340;
  var EASE = "cubic-bezier(.2,.8,.2,1)";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var open = null;       // state of the image currently enlarged

  function fullSrc(img) {
    var a = img.closest("a[href]");
    return a && IMG_FILE.test(a.getAttribute("href")) ? a.href : (img.currentSrc || img.src);
  }

  function captionFor(img) {
    var fig = img.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    return cap ? cap.textContent.trim() : "";
  }

  function eligible(img) {
    if (img.hasAttribute("data-no-zoom") || img.closest("[data-no-zoom], .card")) return false;
    var a = img.closest("a[href]");
    if (a && !IMG_FILE.test(a.getAttribute("href"))) return false;   // links to another page
    if (/logo/i.test(img.getAttribute("src") || "")) return false;
    return true;
  }

  function targetBox(naturalW, naturalH, capH) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var m = Math.round(Math.min(vw, vh) * MARGIN) + 8;
    var maxW = vw - 2 * m, maxH = vh - 2 * m - capH;
    var s = Math.min(maxW / naturalW, maxH / naturalH, 2.5);   // don't blow small images up past 2.5x
    var w = naturalW * s, h = naturalH * s;
    return { left: (vw - w) / 2, top: (vh - h - capH) / 2, width: w, height: h };
  }

  function show(img) {
    if (open) return;
    var from = img.getBoundingClientRect();
    var nw = img.naturalWidth || from.width, nh = img.naturalHeight || from.height;

    var root = document.createElement("div");
    root.className = "lb";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", img.alt ? "Enlarged image: " + img.alt : "Enlarged image");

    var back = document.createElement("div");
    back.className = "lb-backdrop";

    var big = document.createElement("img");
    big.className = "lb-img";
    big.alt = img.alt || "";
    big.src = img.currentSrc || img.src;           // start with the already-loaded image
    var hi = fullSrc(img);
    if (hi !== big.src) {                           // swap in the full-size file once it loads
      var pre = new Image();
      pre.onload = function () { if (open && open.big === big) big.src = hi; };
      pre.src = hi;
    }

    var text = captionFor(img);
    var cap = document.createElement("p");
    cap.className = "lb-caption";
    cap.textContent = text;
    if (!text) cap.hidden = true;

    var close = document.createElement("button");
    close.type = "button";
    close.className = "lb-close";
    close.setAttribute("aria-label", "Close enlarged image");
    close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    root.appendChild(back); root.appendChild(big); root.appendChild(cap); root.appendChild(close);
    document.body.appendChild(root);
    document.documentElement.classList.add("lb-lock");

    var capH = text ? cap.offsetHeight + 14 : 0;
    var to = targetBox(nw, nh, capH);
    place(big, to);
    cap.style.top = (to.top + to.height + 14) + "px";

    open = { root: root, back: back, big: big, cap: cap, close: close, src: img, to: to, closing: false };

    back.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION, easing: "ease-out", fill: "both" });
    fadeIn([cap, close]);
    if (reduce) {
      big.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: "both" });
    } else {
      big.animate([flip(from, to), { transform: "none", opacity: 1 }], { duration: DURATION, easing: EASE, fill: "both" });
      img.style.visibility = "hidden";             // the enlarged copy stands in for it while open
    }

    close.focus({ preventScroll: true });
    root.addEventListener("click", hide);
    window.addEventListener("resize", onResize);
  }

  function hide() {
    if (!open || open.closing) return;
    var o = open; o.closing = true;
    var from = o.src.getBoundingClientRect();
    var onScreen = from.bottom > 0 && from.top < window.innerHeight && from.width > 0;

    var a = o.back.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DURATION * 0.85, easing: "ease-in", fill: "both" });
    [o.cap, o.close].forEach(function (el) { el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: "both" }); });
    if (reduce || !onScreen) {
      o.big.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "both" });
    } else {
      o.big.animate([{ transform: "none", opacity: 1 }, flip(from, o.to)], { duration: DURATION * 0.85, easing: EASE, fill: "both" });
    }
    a.onfinish = function () {
      o.src.style.visibility = "";
      o.root.remove();
      document.documentElement.classList.remove("lb-lock");
      window.removeEventListener("resize", onResize);
      if (o.src.matches(".zoomable")) o.src.focus({ preventScroll: true });
      else { var link = o.src.closest("a"); if (link) link.focus({ preventScroll: true }); }
      open = null;
    };
  }

  function onResize() {
    if (!open || open.closing) return;
    var capH = open.cap.hidden ? 0 : open.cap.offsetHeight + 14;
    open.to = targetBox(open.src.naturalWidth || open.to.width, open.src.naturalHeight || open.to.height, capH);
    place(open.big, open.to);
    open.cap.style.top = (open.to.top + open.to.height + 14) + "px";
  }

  // Transform that makes the enlarged image sit exactly over the thumbnail (uniform scale, centers aligned).
  function flip(from, to) {
    var s = Math.max(from.width / to.width, from.height / to.height);
    var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    return { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")", opacity: 1 };
  }

  function place(el, r) {
    el.style.left = r.left + "px"; el.style.top = r.top + "px";
    el.style.width = r.width + "px"; el.style.height = r.height + "px";
  }

  function fadeIn(els) {
    els.forEach(function (el) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: reduce ? 0 : DURATION * 0.6, easing: "ease-out", fill: "both" });
    });
  }

  function init() {
    document.querySelectorAll("main img").forEach(function (img) {
      if (!eligible(img)) return;
      var link = img.closest("a[href]");
      if (link) {
        link.classList.add("zoom-link");
        link.addEventListener("click", function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;   // let "open in new tab" work
          e.preventDefault(); show(img);
        });
        return;
      }
      img.classList.add("zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Enlarge image" + (img.alt ? ": " + img.alt : ""));
      img.addEventListener("click", function () { show(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(img); }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); hide(); }
      if (e.key === "Tab") { e.preventDefault(); open.close.focus(); }   // keep focus inside the dialog
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
