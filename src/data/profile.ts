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

/** About → How I work. */
export const DRIVES: { t: string; x: string }[] = [
  {
    t: "Systems that stay up",
    x: "I care about the boring numbers: latency, uptime and how quickly something recovers. A feature isn't done when it works on my machine; it's done when it survives a bad deploy, a slow dependency and a Monday morning.",
  },
  {
    t: "Measure, then optimise",
    x: "Before I change anything I want a number for it: a benchmark, a log, a dashboard. It keeps me honest, and it turns \"I think it's faster\" into \"it's 20% faster\".",
  },
  {
    t: "Automating the toil",
    x: "If a team does something by hand twice, I want a script, a pipeline or an API for it. At PPD that habit became 50+ tools that thousands of people used every day.",
  },
  {
    t: "Hardware meets software",
    x: "Hardware was my dad's world and caught my interest early; software has always been my love. IoT is where the two meet, and it taught me to respect memory, power and the network.",
  },
];

/** About → Currently. */
export const CURRENTLY: { k: string; v: string }[] = [
  { k: "building", v: "A smart expense and investment tracker, so future me finally knows where all the money went." },
  { k: "learning", v: "System design and AI at Zoppler Systems. Drawing a lot of boxes and arrows, and the arrows are getting better." },
  { k: "reading", v: "Manga and thrillers, firmly in the \"just one more chapter\" phase at 1 a.m." },
  { k: "watching", v: "Every F1 race weekend, and as much football as the calendar allows." },
  { k: "cooking", v: "New recipes on weekends, with music on loud. The success rate beats my first deploys." },
  { k: "planning", v: "The next trip to the mountains. The packing list is version-controlled, obviously." },
  { k: "looking for", v: "Backend, platform and SWE roles. My inbox is open." },
];

/** About → Outside work. */
export const OUTSIDE = {
  text: "Away from the keyboard you'll find me in the kitchen with music on, planning the next trip to the mountains, or arguing about F1 and football. Somewhere in between there's always a manga or a thriller on the go.",
  cards: [
    {
      e: "🍳",
      t: "Cooking & music",
      x: "My therapy. Something on the stove, a playlist on loud, and the day's bugs quietly fade out. Cooking is the one place where \"it works on my machine\" is all that matters.",
    },
    {
      e: "🏔️",
      t: "Mountains",
      x: "Travel anywhere is good; the mountains are where I find peace. Cold air, no notifications and a view that makes every production incident feel very small.",
    },
    {
      e: "🏎️",
      t: "Formula 1",
      x: "Race weekends are blocked on my calendar. You can love Max Verstappen or hate him, but you can't argue with the brilliance. Also, a pit stop is the best latency benchmark in sport.",
    },
    {
      e: "⚽",
      t: "Football",
      x: "Real Madrid, through and through. Champions League nights are non-negotiable, and nothing beats a late Madrid comeback. Cristiano Ronaldo is the GOAT: the four Champions Leagues in white, the goals and a work ethic every engineer could learn from. I'm open to discussing literally anything else. ¡Hala Madrid!",
    },
    {
      e: "📚",
      t: "Reading",
      x: "Manga, plus thriller and suspense novels: anything with a twist I don't see coming, which is harder than it sounds after years of reading stack traces.",
    },
  ],
  interests: ["Cooking", "Music", "Mountains", "Travelling", "Formula 1", "Football", "Real Madrid", "Manga", "Thrillers & suspense"],
  photo: { src: "/images/snow.webp", alt: "Baibhav smiling by a wooden fence in front of a snowy river and pine forest", w: 1600, h: 900 },
};
