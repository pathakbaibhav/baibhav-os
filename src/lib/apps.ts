export type AppId =
  | "about"
  | "projects"
  | "resume"
  | "skills"
  | "terminal"
  | "lab"
  | "github"
  | "writing"
  | "contact"
  | "settings"
  | "help"
  | "arcade";

export type AppMeta = {
  id: AppId;
  label: string;
  title: string; // menu bar name
  icon: string; // stroke SVG path, 24×24 viewBox
  color: string; // Launchpad / phone tile color
  size: { w: number; h: number };
  ready: boolean; // false → "coming soon" window
  blurb: string; // one line for Help and the page <meta> description
};

export const ICONS = {
  about:
    "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM7 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 16c.5-1.5 2-2.5 3-2.5s2.5 1 3 2.5M14 9h4M14 12h4",
  projects: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  resume: "M6 3h9l4 4v14H6zM14 3v4h4M9 11h7M9 14h7M9 17h5",
  skills: "M3 12h4l3-8 4 16 3-8h4",
  terminal:
    "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM7 9l3 3-3 3M13 15h4",
  lab: "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4",
  github:
    "M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  writing: "M4 20h4L20 8l-4-4L4 16z",
  contact: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l9 6 9-6",
  settings: "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4",
  help: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6",
  arcade:
    "M6 11h4M8 9v4M15 12h.01M18 10h.01M7 6h10a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-1a5 5 0 0 1 5-5z",
  launchpad:
    "M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z",
  search: "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M21 21l-4.5-4.5",
  sun: "M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  back: "M15 6l-6 6 6 6",
} as const;

const app = (
  id: AppId,
  label: string,
  color: string,
  w: number,
  h: number,
  blurb: string,
  ready = true,
): AppMeta => ({ id, label, title: `${label}.app`, icon: ICONS[id], color, size: { w, h }, ready, blurb });

export const APPS: Record<AppId, AppMeta> = {
  about: app("about", "About Me", "#2F6FED", 1080, 700, "Who I am: overview, journey, what drives me, what I am doing now."),
  projects: app("projects", "Projects", "#E8893C", 1120, 700, "Filterable index of my work, with a full case study for each project."),
  resume: app("resume", "Resume", "#D9A43A", 1000, 700, "My resume: summary, experience, projects, skills and education."),
  skills: app("skills", "Skills", "#8B6CF0", 1000, 660, "Every tool I use, and the jobs and projects where I used it."),
  terminal: app("terminal", "Terminal", "#2B3140", 880, 580, "A working shell. Try help, projects or route park-street harvard."),
  lab: app("lab", "Lab", "#1C9DB8", 1120, 700, "Live status, latency and traffic for the APIs I run."),
  github: app("github", "GitHub", "#2D9C6A", 520, 360, "My contribution graph, recent commits and pinned repositories, pulled live.", false),
  writing: app("writing", "Writing", "#C2557A", 520, 360, "Build logs and deep dives on the projects.", false),
  contact: app("contact", "Contact", "#D9506A", 560, 440, "Send me a message, or grab my email and links."),
  settings: app("settings", "Settings", "#5A6272", 800, 640, "Theme, accent color, wallpaper, sound and motion."),
  help: app("help", "Help", "#C9862E", 1080, 700, "How baibhavOS works: a quick tour, every app, shortcuts and phone tips."),
  arcade: app("arcade", "Arcade", "#3BA55C", 520, 360, "Small games, for when you need a break.", false),
};

export const LAUNCHPAD_ORDER: AppId[] = [
  "about", "projects", "resume", "skills", "terminal", "lab",
  "github", "writing", "contact", "settings", "help", "arcade",
];

export const DESKTOP_ICONS: AppId[] = ["about", "projects", "resume", "terminal", "help"];

// null = separator
export const DOCK: (AppId | "launchpad" | null)[] = [
  "launchpad", "about", "projects", "resume", "terminal", "lab", "github", "contact", null, "settings", "help",
];
