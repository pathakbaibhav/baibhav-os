# Content needed before launch

Everything the OS is waiting on from Baibhav. The short-answer questionnaire that collects all of it lives in `content-inbox/QUESTIONNAIRE.md` (git-ignored, so answers and files stay private until reviewed). The code ships with placeholders (shown in `[brackets]`) until each item arrives. Collected at the end, after the OS is built; this list grows as phases add features.

## About you

- [x] **Portrait**: the dark-blazer office photo, cropped to 4:5 for About (`public/images/portrait.webp`) and square for avatars and link previews (`avatar.webp`). Originals in `content-inbox/photos/`.
- [x] **Outside work**: cooking, travelling, manga, thriller and suspense novels, with the snow photo (`public/images/snow.webp`).
- [x] **"Now" line**: "Building a smart expense and investment tracker." (also About → Currently → building).
- [x] **Origin story**: Journey now opens with Class 1 (games with dad), Class 8 (first code) and Class 10 (decided on CS); the About overview and "Hardware meets software" were rewritten to match.
- [x] **Currently**: building (expense & investment tracker), learning (system design and AI, for work at Zoppler Systems), reading (manga, thriller and suspense novels), looking for (backend, platform and SWE roles).
- [x] **Current job**: Senior Software Engineer, Zoppler Systems, Bangalore, Oct 2026 – Present (C++, Python); in Experience, Resume, Journey, Skills and the terminal.
- [ ] **Zoppler bullet points**: 2–4 points on what you build there (later, as you said).
- [x] **Location**: Bangalore, India (About facts, Resume, boot screen).
- [x] **Availability**: "Open to backend, platform and SWE roles" (confirmed).
- [x] **Public email**: pathak.ba@northeastern.edu (confirmed).

## Resume

- [x] **Resume PDF**: one-page version without the phone number at `public/resume.pdf`, built from `scripts/resume/resume.html` (`npm run resume`). The Read view keeps the full multipage detail. Regenerate after the Zoppler bullets, and switch the "Portfolio" link to the new domain at launch.

## Projects (src/data/projects.ts)

For each of the four case studies:

- [x] **Demo media**: real screenshots: ASL live demo, three from the subway repo, three of baibhavOS itself. ViT media comes with your project update; no drone media (box hidden). An ASL signing GIF needs a camera, so record one if you want it.
- [x] **"What didn't work"**: skipped; the box is hidden.
- [x] **Team or solo**: solo for all except the ViT (team project).

Specific gaps:

- [ ] **ViT**: you're updating the project; send the changes, accuracy and any images.
- [x] **ASL**: live demo and source now point to ASL-Interpretation-And-Learning-Tool.
- [x] **Extra projects**: AutoPulse left out; the old portfolio replaced by baibhavOS (project 05).

## Lab and live data (Phase 6, built)

- [x] **Edge devices**: the Lab stays without them.
- [ ] **Optional keys** for higher rate limits: `GITHUB_TOKEN`, `MBTA_API_KEY` (see `.env.example`).

## Writing

- [ ] **Writing**: posts come later (the app shows "first posts are in the works" until then).

## Contact form (Phase 6)

- [x] **Destination email**: pathak.ba@northeastern.edu (confirmed).
- [ ] **Resend API key**: create a free Resend account and add `RESEND_API_KEY` in Vercel; until then the form points visitors to email and LinkedIn.

## Launch (Phase 8)

- [ ] **Domain**: pick and buy (e.g. baibhav.dev, ~$12/yr), then set `NEXT_PUBLIC_SITE_URL`.
- [ ] **Vercel**: connect your account to the GitHub repo.
- [ ] **Analytics**: built in (Vercel Analytics, no cookies); turn on "Web Analytics" in the Vercel project after the first deploy.
- [ ] **iCloud**: move the project out of `~/Documents` (it syncs to iCloud and creates duplicate " 2" files), e.g. to `~/Developer/baibhav-os`.
