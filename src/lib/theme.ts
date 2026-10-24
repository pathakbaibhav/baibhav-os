// Theme constants shared by the client stores and the pre-paint <head> script.
// Kept free of React and zustand so the server layout can import it.

export type Theme = "dark" | "light" | "auto";

export const ACCENTS = {
  Cyan: { dark: "#7FD4E8", light: "#1C84AA" },
  Amber: { dark: "#F4A766", light: "#B4621F" },
  Violet: { dark: "#A78BFA", light: "#6D4FD8" },
  Green: { dark: "#6EE7B7", light: "#1F8A63" },
} as const;
export type Accent = keyof typeof ACCENTS;

export const SETTINGS_KEY = "baibhavos-settings";

export type WallpaperId = "code" | "circuit";

/**
 * Runs before first paint: applies the saved theme, motion and accent to <html>
 * so light-mode visitors never see a flash of the dark desktop. Mirrors useThemeSync.
 */
export const THEME_SCRIPT = `(function(){try{var s=(JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)})||"{}").state)||{};var t=s.theme||"dark";if(t==="auto")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";var r=document.documentElement;r.dataset.theme=t;r.dataset.motion=s.motion===false?"off":"on";var a=${JSON.stringify(ACCENTS)}[s.accent||"Cyan"];if(a)r.style.setProperty("--accent",a[t]);}catch(e){}})();`;
