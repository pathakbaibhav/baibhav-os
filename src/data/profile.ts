// Who I am. Every app reads from here; nothing in the UI hard-codes these.
// Bracketed values are placeholders until the real content arrives.

export const PROFILE = {
  name: "Baibhav Pathak",
  role: "Backend Engineer · Systems, APIs & IoT.",
  headline: "I build backend systems that ship, scale and stay up.",
  location: "Boston, MA",
  email: "pathak.ba@northeastern.edu",
  github: "https://github.com/pathakbaibhav",
  linkedin: "https://www.linkedin.com/in/baibhavkp",
  now: "[What you're building this month]",
};

export const FACTS: { k: string; v: string }[] = [
  { k: "focus", v: "Backend · APIs · automation" },
  { k: "based in", v: PROFILE.location },
  { k: "languages", v: "Python · Go · TypeScript" },
  { k: "status", v: "Open to SWE roles" },
  { k: "background", v: "IoT · embedded systems" },
  { k: "education", v: "M.S. IoT, Northeastern" },
];

export const JOURNEY: { year: string; title: string; text: string }[] = [
  {
    year: "[year]",
    title: "[The moment I got hooked]",
    text: "[Your origin story: the first computer, program or gadget that made you want to build things.]",
  },
  { year: "2016", title: "Computer Science at VTU", text: "Started a B.Tech in Computer Science in India." },
  {
    year: "2019",
    title: "A drone that flew on cell towers",
    text: "Built an autonomous quadcopter with cellular routing: my first time making hardware and software work as one system.",
  },
  {
    year: "2021",
    title: "Backend & automation at PPD (Thermo Fisher)",
    text: "Shipped 50+ automation tools to 10,000+ people and learned what production really means.",
  },
  {
    year: "2023",
    title: "Boston, for an M.S. in IoT",
    text: "Northeastern University: edge AI, SystemC and the ASL and subway projects.",
  },
  {
    year: "2025",
    title: "Control-plane services at IpserLabs",
    text: "Built JWT/RBAC-secured APIs and CI/CD for services used by 1K+ people daily.",
  },
];

export const DRIVES: { t: string; x: string }[] = [
  { t: "Systems that stay up", x: "I care about the boring numbers: latency, uptime and how quickly something recovers." },
  { t: "Hardware meets software", x: "Sensors, protocols and the backends that make sense of them. IoT is where I started." },
  { t: "Automating the toil", x: "If a team does something by hand twice, I want a script, a pipeline or an API for it." },
];

export const CURRENTLY: { k: string; v: string }[] = [
  { k: "building", v: "[What you are building right now]" },
  { k: "learning", v: "[A technology you are learning]" },
  { k: "reading", v: "[A book or paper]" },
  { k: "looking for", v: "Backend, platform and SWE roles" },
];
