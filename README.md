# baibhavOS

Baibhav Pathak's portfolio, built as a small operating system that runs in the browser. It boots, opens apps in draggable glass windows, and turns into a phone home screen on small screens.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run check` | Lint, typecheck and unit tests (what CI runs, minus the build) |
| `npm test` | Unit tests only (Vitest) |

Node 22 is pinned in `.nvmrc`; anything from Node 20 up works.

## Where things live

```
src/
  app/              Next.js entry: layout, global tokens (globals.css), the single page
  components/os/    The OS: boot, desktop, menu bar, dock, windows, Launchpad, phone, wallpaper
  components/apps/  One file per app (About, Projects, Terminal, Lab, Settings, Help, Contact)
  data/             All portfolio content: profile, projects + case studies, experience, skills
  lib/              Framework-free logic: app registry, window manager, terminal, search, stores
```

- **Content** lives only in `src/data/`. Change a project or a job there and every app, Spotlight and the terminal pick it up.
- **Apps** are registered in `src/lib/apps.ts` (label, icon, colour, default size). Apps marked `ready: false` open a "coming soon" window.
- **Window logic** is pure functions in `src/lib/windows.ts`, wrapped by a Zustand store in `src/lib/store.ts`, so it is unit-tested without React.
- **Theme**: dark is the default; `<html data-theme="light">` switches the CSS tokens in `globals.css`. Settings persists theme, accent, motion and sound in `localStorage`.

## Placeholders

Text in `[brackets]` in `src/data/` is waiting for real content: the "Now" line, the origin story in the About journey, the "Currently" rows, and the case-study demo GIF and "what didn't work" story.

## Roadmap

| Phase | Scope |
|---|---|
| 0 | Project setup, content data, CI ✅ |
| 1 | OS core: desktop, menu bar, dock, window manager, dark/light, a URL per app |
| 2 | Look and feel: 3D code-pane wallpaper, boot screen, motion |
| 3 | Content apps: About, Projects + case studies, Resume, Skills, Contact |
| 4 | System apps: Help + tours, Settings, Launchpad, Spotlight, right-click menu |
| 5 | Phone layout |
| 6 | Live data: terminal + Lab on real APIs, GitHub, Writing, Arcade |
| 7 | Launch: performance, accessibility, link previews, domain |
