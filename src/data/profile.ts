// Who I am. Every app reads from here; nothing in the UI hard-codes these.
// Bracketed values are placeholders until the real content arrives.

export const PROFILE = {
  name: "Baibhav Pathak",
  role: "Backend Engineer · Systems, APIs & IoT.",
  headline: "I build backend systems that ship, scale and stay up.",
  location: "Bangalore, India",
  email: "pathak.ba@northeastern.edu",
  github: "https://github.com/pathakbaibhav",
  linkedin: "https://www.linkedin.com/in/baibhavkp",
  now: "Starting on a smart expense and investment tracker.",
  /** Photos in /public/images, cropped and stripped of metadata from the originals in content-inbox/photos. */
  portrait: "/images/portrait.webp",
  avatar: "/images/avatar.webp",
};

export const FACTS: { k: string; v: string }[] = [
  { k: "focus", v: "Backend · APIs · automation" },
  { k: "based in", v: PROFILE.location },
  { k: "languages", v: "Python · Go · TypeScript" },
  { k: "status", v: "Open to SWE roles" },
  { k: "background", v: "Software Engineer · IoT" },
  { k: "education", v: "M.S. IoT, Northeastern" },
];

export const JOURNEY: { year: string; title: string; text: string }[] = [
  {
    year: "Class 1",
    title: "Games with my dad",
    text: "My earliest computer memory is playing games with my dad. He's an electrical engineer, and whenever something at home broke he'd take it apart to fix it, with me right beside him trying to help.",
  },
  {
    year: "Class 8",
    title: "My first code",
    text: "A small front-end project for a regional competition. Our CS teacher encouraged a few of my friends and me to enter, since we were the ones most into computers.",
  },
  {
    year: "Class 10",
    title: "Computer science, decided",
    text: "By class 10 I knew I wanted to study computer science, with a lot of TV shows and movies inspiring me along the way.",
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
  {
    year: "2026",
    title: "Senior Software Engineer at Zoppler Systems",
    text: "Back in Bangalore, building with C++ and Python and learning system design and AI along the way.",
  },
];

export const DRIVES: { t: string; x: string }[] = [
  { t: "Systems that stay up", x: "I care about the boring numbers: latency, uptime and how quickly something recovers." },
  { t: "Hardware meets software", x: "Hardware was my dad's world and caught my interest early; software has always been my love. IoT is where the two meet." },
  { t: "Automating the toil", x: "If a team does something by hand twice, I want a script, a pipeline or an API for it." },
];

export const CURRENTLY: { k: string; v: string }[] = [
  { k: "building", v: "Just starting a smart expense and investment tracker" },
  { k: "learning", v: "System design and AI, for my work as a Senior Software Engineer at Zoppler Systems" },
  { k: "reading", v: "Manga, and thriller and suspense novels" },
  { k: "looking for", v: "Backend, platform and SWE roles" },
];

/** About → Outside work. */
export const OUTSIDE = {
  text: "Away from the keyboard I cook, travel whenever I get the chance, and read: manga, plus thriller and suspense novels.",
  interests: ["Cooking", "Travelling", "Manga", "Thrillers & suspense"],
  photo: { src: "/images/snow.webp", alt: "Baibhav smiling by a wooden fence in front of a snowy river and pine forest", w: 1600, h: 900 },
};
