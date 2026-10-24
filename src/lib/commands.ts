"use client";

import { useOS, useSettings } from "./store";

// Every OS-level action in one place, so the menu bar, the desktop context
// menu and the keyboard shortcuts can never drift apart.

const os = () => useOS.getState();

const withFocused = (fn: (id: NonNullable<ReturnType<typeof os>["focused"]>) => void) => () => {
  const id = os().focused;
  if (id) fn(id);
};

export const commands = {
  newTerminal: () => os().open("terminal"),
  launchpad: () => os().setLaunchpad(true),
  spotlight: () => os().setLaunchpad(true, true),
  help: () => os().open("help"),
  aboutOS: () => os().open("help", { section: "credits" }),
  settings: () => os().open("settings"),
  closeWindow: withFocused((id) => os().close(id)),
  minimize: withFocused((id) => os().minimize(id)),
  maximize: withFocused((id) => os().toggleMaximize(id)),
  snapLeft: withFocused((id) => os().snap(id, "left")),
  snapRight: withFocused((id) => os().snap(id, "right")),
  cycle: () => os().cycle(),
  toggleTheme: () => {
    const light = document.documentElement.dataset.theme === "light";
    useSettings.getState().set({ theme: light ? "dark" : "light" });
  },
  /** About → Projects → Resume, opened one after another for a recruiter in a hurry. */
  recruiterTour: () => {
    os().open("about");
    setTimeout(() => os().open("projects"), 250);
    setTimeout(() => os().open("resume"), 500);
  },
};
