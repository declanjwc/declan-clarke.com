/* Intro: aircraft flies in facing right, yaws into the project-card orientation,
   then glides toward the featured project card while the page fades in.
   All settings live in intro-config.js. Add ?intro=1 to the URL to replay it. */
(function () {
  var C = window.INTRO_CONFIG;
  var root = document.documentElement;
  if (!C || !C.enabled || !C.frames || !C.frames.length) return;

  var force = /[?&]intro=1\b/.test(location.search);
  var seen = false;
  try { seen = C.once === "session" && sessionStorage.getItem("introSeen") === "1"; } catch (e) {}
  var reduce = C.respectReducedMotion && window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var deepLink = location.hash && location.hash.length > 1;
  if (!force && (seen || reduce || deepLink)) return;
  if (!("animate" in document.documentElement)) return;

  root.classList.add("intro-pending");
  var failsafe = setTimeout(done, 10000);
  var overlay, backdrop, plane;

  function done() {
    clearTimeout(failsafe);
    root.classList.remove("intro-pending", "intro-running");
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
  }
  function skip() { window.scrollTo(0, 0); done(); }

  function rectOfContain(img) {   // where an object-fit:contain image actually draws
    var r = img.getBoundingClientRect(), ar = C.aspect, w = r.width, h = r.height;
    if (w / h > ar) { var nw = h * ar; return { left: r.left + (w - nw) / 2, top: r.top, width: nw, height: h }; }
    var nh = w / ar; return { left: r.left, top: r.top + (h - nh) / 2, width: w, height: nh };
  }

  function start() {
    var W = innerWidth, H = innerHeight, T = C.timing, Hd = C.heading || {};
    var pw = Math.min(W * C.width.fraction, C.width.max), ph = pw / C.aspect;
    var P = Hd.perspective || 1400, yaw0 = Hd.enterYaw || 0, roll0 = Hd.enterRoll || 0, bank = Hd.bank || [0, 0, 0];
    function pos(p) { return [p[0] * W - pw / 2, p[1] * H - ph / 2]; }
    function tf(p, yaw, roll, s) {
      return "translate(" + p[0] + "px," + p[1] + "px) perspective(" + P + "px) rotateY(" + yaw + "deg) rotate(" + roll + "deg) scale(" + (s || 1) + ")";
    }

    overlay = document.createElement("div");
    overlay.className = "intro";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = '<div class="intro-backdrop"></div><div class="intro-plane"></div>' +
      '<button class="intro-skip" type="button">Skip intro</button>';
    document.body.appendChild(overlay);
    backdrop = overlay.querySelector(".intro-backdrop");
    plane = overlay.querySelector(".intro-plane");
    plane.style.width = pw + "px"; plane.style.height = ph + "px";

    var imgs = C.frames.map(function (f, i) {
      var im = new Image(); im.src = f.src; im.alt = ""; im.decoding = "async";
      im.style.opacity = i === 0 ? "1" : "0"; plane.appendChild(im); return im;
    });

    overlay.querySelector(".intro-skip").addEventListener("click", skip);
    overlay.addEventListener("click", function (e) { if (e.target === overlay || e.target === backdrop) skip(); });
    addEventListener("keydown", function k(e) { if (e.key === "Escape") { removeEventListener("keydown", k); skip(); } });

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    var sec = C.scrollTo && document.querySelector(C.scrollTo);
    window.scrollTo(0, sec ? Math.max(0, sec.getBoundingClientRect().top + scrollY - 76) : 0);
    root.classList.add("intro-running");
    root.classList.remove("intro-pending");

    var a = pos(C.path.start), b = pos(C.path.mid), c = pos(C.path.end);
    var t0 = T.blank, t1 = t0 + T.flyIn, t2 = t1 + T.turn, t3 = t2 + T.hold;

    // 1) fly in, nose pointing right
    plane.animate([
      { transform: tf(a, yaw0, roll0 + bank[0]), opacity: 0, offset: 0 },
      { transform: tf(a, yaw0, roll0 + bank[0]), opacity: 1, offset: 0.02 },
      { transform: tf(b, yaw0, roll0 + bank[1]), offset: 0.62 },
      { transform: tf(c, yaw0, roll0 + bank[2]), offset: 1 }
    ], { duration: T.flyIn, delay: t0, easing: "cubic-bezier(.22,.7,.3,1)", fill: "both" });

    // 2) yaw turn into the project-card orientation (swap to the last frame along the way)
    plane.animate([
      { transform: tf(c, yaw0, roll0 + bank[2]) },
      { transform: tf(c, 0, 0) }
    ], { duration: T.turn, delay: t1, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" });
    if (imgs.length > 1) {
      var last = imgs[imgs.length - 1];
      last.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T.turn * 0.5, delay: t1 + T.turn * 0.25, fill: "forwards" });
      imgs[0].animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.turn * 0.5, delay: t1 + T.turn * 0.25, fill: "forwards" });
    }

    // 3) glide toward the project card while the page fades in
    setTimeout(function () {
      var target = document.querySelector(C.landOn);
      var r = target ? rectOfContain(target) : { left: c[0], top: H + 40, width: pw * 0.5, height: ph * 0.5 };
      var s = r.width / pw;
      plane.getAnimations().forEach(function (an) { an.cancel(); });
      plane.style.transformOrigin = "0 0";
      plane.animate([
        { transform: "translate(" + c[0] + "px," + c[1] + "px) scale(1)" },
        { transform: "translate(" + r.left + "px," + r.top + "px) scale(" + s + ")" }
      ], { duration: T.land, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" });
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.land * 0.8, delay: T.land * 0.1, easing: "ease-out", fill: "forwards" });
      setTimeout(done, T.land + 60);
    }, t3);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
