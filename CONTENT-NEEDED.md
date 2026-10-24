# Content needed before launch

Everything the OS is waiting on from Baibhav. The code ships with placeholders (shown in `[brackets]`) until each item arrives. Collected at the end, after the OS is built; this list grows as phases add features.

## About you

- [ ] **Portrait / headshot**: About Me (Overview). Square-ish, at least 600 × 750 px. *(src/components/apps/About.tsx)*
- [ ] **"Now" line**: one sentence on what you're building this month, for the desktop widget. *(PROFILE.now in src/data/profile.ts)*
- [ ] **Origin story**: the first item in About → Journey: a year, a short title and 1–2 sentences on what got you into building things. *(JOURNEY in src/data/profile.ts)*
- [ ] **Currently**: what you're building, learning and reading right now. *(CURRENTLY in src/data/profile.ts)*
- [ ] **Confirm** location "Boston, MA" and the availability line "Open to backend, platform and SWE roles".

## Resume

- [ ] **Resume PDF** for the Resume app's PDF tab and Download link. Decide: a copy without the phone number (recommended; the repo is public), the PDF as is, or a different file. Source found: `~/Downloads/Resume_Multipage.pdf`. *(RESUME_PDF in src/data/experience.ts)*

## Projects (src/data/projects.ts)

For each of the four case studies:

- [ ] **Demo media**: ASL practice-mode GIF; subway closure-reroute GIF; ViT SystemC module diagram or simulation trace; drone photo or flight clip.
- [ ] **"What didn't work"**: one honest dead end per project and how you got past it.
- [ ] **Team or solo?** for each project (shown in the case-study header).

Specific gaps:

- [ ] **ViT**: accuracy after the fixed-point conversion.
- [ ] **ASL**: live demo URL, if it's deployed anywhere.
- [ ] **Decide** whether to add two more resume projects: *Personal Developer Portfolio Website* (resume says Next.js/FastAPI/PostgreSQL/Docker/AWS; the current site looks like plain HTML, so which is right?) and *AutoPulse* (private repo, in progress).

## Lab and live data (Phase 6)

- [ ] **MBTA route API**: where it will run, so the Lab and the desktop "Systems" widget can show its real p50 latency, uptime and alert count (currently `[p50]`, `[ ms ]`, `[ n ]`).
- [ ] **ASL API**: hosting for live uptime (`[ % ]`).
- [ ] **Edge devices**: is there a real ESP32 sensor node / Raspberry Pi gateway to show? If not, that panel comes out. *(src/components/apps/Lab.tsx)*

## Writing

- [ ] **First posts** (2–3). Suggested topics: micro-batching the ASL API from 443 to 1,569 req/s; rerouting the subway graph around live closures; lessons from shipping 50+ automation tools at PPD.

## Launch (Phase 7)

- [ ] **Domain**: pick and buy (e.g. baibhav.dev, ~$12/yr), then set `NEXT_PUBLIC_SITE_URL`.
- [ ] **Vercel**: connect your account to the GitHub repo.
- [ ] **iCloud**: move the project out of `~/Documents` (it syncs to iCloud and creates duplicate " 2" files), e.g. to `~/Developer/baibhav-os`.
