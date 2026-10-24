// True unless the visitor turned motion off in Settings or asked the OS to
// reduce motion. JS-driven effects check this; CSS animations are switched off
// by the matching rules in globals.css.
export function motionOK(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.dataset.motion !== "off" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
