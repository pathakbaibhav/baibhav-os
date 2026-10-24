import Link from "next/link";
import { APPS, LAUNCHPAD_ORDER } from "@/lib/apps";
import { pathFor, type Route } from "@/lib/routes";
import { DRIVES, FACTS, JOURNEY, PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { EDUCATION, JOBS } from "@/data/experience";
import { SKILLS } from "@/data/skills";

// Server-rendered text version of a page: what crawlers, link previews and
// screen readers get before the OS boots. It is visually hidden and replaced by
// the OS on mount, so sighted visitors never see it.

function Projects() {
  return (
    <section>
      <h2>Projects</h2>
      {PROJECTS.map((p) => (
        <article key={p.slug}>
          <h3>
            <Link href={pathFor("projects", { sel: p.num, view: "case" })}>{p.title}</Link>
          </h3>
          <p>{p.tagline} {p.desc}</p>
          <p>{p.metrics.map((m) => `${m.v} ${m.l}`).join(" · ")}. Built with {p.stack.join(", ")}.</p>
        </article>
      ))}
    </section>
  );
}

function CaseStudy({ num }: { num: string }) {
  const p = PROJECTS.find((x) => x.num === num);
  if (!p) return null;
  const cs = p.caseStudy;
  return (
    <article>
      <h2>{p.title}</h2>
      <p>{cs?.headline ?? p.tagline}</p>
      <p>{cs?.overview ?? p.desc}</p>
      <ul>
        {(cs?.results ?? p.metrics).map((m) => (
          <li key={m.l}>{m.v} {m.l}</li>
        ))}
      </ul>
      {cs?.story.map((s) => (
        <section key={s.h}>
          <h3>{s.h}</h3>
          <p>{s.p}</p>
        </section>
      ))}
      {p.source && <p><a href={p.source}>Source on GitHub</a></p>}
    </article>
  );
}

function Experience() {
  return (
    <section>
      <h2>Experience</h2>
      {JOBS.map((j) => (
        <article key={j.id}>
          <h3>{j.role}, {j.company}</h3>
          <p>{j.dates} · {j.location}</p>
          <ul>{j.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        </article>
      ))}
      <h2>Education</h2>
      <ul>{EDUCATION.map((e) => <li key={e.school}>{e.degree}, {e.school} ({e.dates})</li>)}</ul>
    </section>
  );
}

function Skills() {
  return (
    <section>
      <h2>Skills</h2>
      <ul>{SKILLS.map((g) => <li key={g.name}>{g.name}: {g.items.join(", ")}</li>)}</ul>
    </section>
  );
}

function About() {
  return (
    <section>
      <h2>About</h2>
      <ul>{FACTS.map((f) => <li key={f.k}>{f.k}: {f.v}</li>)}</ul>
      <h3>Journey</h3>
      <ol>{JOURNEY.filter((j) => !j.year.startsWith("[")).map((j) => <li key={j.title}>{j.year}: {j.title}. {j.text}</li>)}</ol>
      <h3>What drives me</h3>
      <ul>{DRIVES.map((d) => <li key={d.t}>{d.t}: {d.x}</li>)}</ul>
    </section>
  );
}

function Body({ route }: { route: Route | null }) {
  if (!route) return <><About /><Projects /><Experience /></>;
  switch (route.app) {
    case "projects":
      return route.params.view === "case" ? <CaseStudy num={route.params.sel} /> : <Projects />;
    case "about":
      return <About />;
    case "resume":
      return <><Experience /><Skills /></>;
    case "skills":
      return <Skills />;
    default:
      return <p>{APPS[route.app].blurb}</p>;
  }
}

export function Summary({ route }: { route: Route | null }) {
  return (
    <div className="sr-only">
      <header>
        <h1>{PROFILE.name}</h1>
        <p>{PROFILE.role} {PROFILE.headline}</p>
        <nav aria-label="Pages">
          <ul>
            <li><Link href="/">Desktop</Link></li>
            {LAUNCHPAD_ORDER.map((id) => <li key={id}><Link href={pathFor(id)}>{APPS[id].label}</Link></li>)}
          </ul>
        </nav>
      </header>
      <main>
        <Body route={route} />
      </main>
      <footer>
        <p>
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> · <a href={PROFILE.github}>GitHub</a> ·{" "}
          <a href={PROFILE.linkedin}>LinkedIn</a>
        </p>
      </footer>
    </div>
  );
}
