"use client";

import { commands } from "@/lib/commands";
import { MenuList, type MenuItem } from "./Menu";
import { useResolvedTheme } from "./useTheme";

export function ContextMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const light = useResolvedTheme() === "light";

  const items: MenuItem[] = [
    { label: "New Terminal", keys: "⌥T", run: commands.newTerminal },
    { label: "Open Launchpad", keys: "F4", run: commands.launchpad },
    { label: "Search…", keys: "⌘K", run: commands.spotlight },
    { label: "Change Wallpaper…", run: commands.wallpaper, sep: true },
    { label: light ? "Switch to Dark" : "Switch to Light", keys: "⇧⌘L", run: commands.toggleTheme },
    { label: "Take the Tour", run: commands.tour, sep: true },
    { label: "Start Recruiter Tour", run: commands.recruiterTour },
    { label: "Help", keys: "?", run: commands.help },
    { label: "About baibhavOS", run: commands.aboutOS },
  ];

  const left = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1440) - 260);
  const top = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 900) - 370);

  return <MenuList items={items} label="Desktop menu" onClose={onClose} style={{ left, top }} />;
}
