/* ============================================================
   Intro animation settings. Edit this file only. No other code changes needed.

   To use new renders (e.g. transparent PNGs exported from SolidWorks):
     1. Export from the SAME camera angle with a transparent background.
     2. Save over assets/img/intro/cruise.webp and hover.webp
        (or point the "src" paths below at your new files, e.g. .png).
     3. If the new images have a different shape, update "aspect" (width / height).
   ============================================================ */
window.INTRO_CONFIG = {
  enabled: true,

  // Frames, in order. Flies in on the first; swaps to the last during the turn
  // (the last frame should match the image in the project card).
  frames: [
    { src: "assets/img/intro/cruise.webp" },
    { src: "assets/img/intro/hover.webp" }
  ],
  aspect: 909 / 615,          // image width / height

  // Timing in milliseconds
  timing: {
    blank: 350,               // navy screen before the aircraft appears
    flyIn: 1500,              // flight across the screen, nose pointing right
    turn: 900,                // yaw turn into the project-card orientation
    hold: 200,                // brief pause after the turn
    land: 1200                // glide toward the project card while the page fades in
  },

  // Flight path as fractions of the screen (0 = left/top, 1 = right/bottom), centre of the aircraft
  path: {
    start: [-0.35, 0.66],
    mid:   [0.30, 0.42],
    end:   [0.50, 0.46]
  },

  // Orientation. The renders face left, so the aircraft flies in mirrored (yaw 180°) to face right,
  // then yaws back to 0° to match the project card.
  heading: {
    enterYaw: 180,            // degrees about the vertical axis on entry (180 = mirrored, nose right)
    enterRoll: -18,           // in-plane tilt during the fly-in, levels the nose
    bank: [-6, -2, 0],        // extra roll at start / middle / end of the fly-in
    perspective: 1400         // 3D depth for the turn (px); larger = flatter
  },

  width: { fraction: 0.62, max: 900 },     // size of the aircraft during flight

  // Where it heads at the end: the element whose box it settles into
  landOn: "[data-intro-target]",
  scrollTo: null,                          // null = page stays at the top; "#projects" = jump there behind the intro

  once: "session",                         // "session" = once per visit, "always" = every load
  respectReducedMotion: true               // skip for visitors who ask for less motion
};
