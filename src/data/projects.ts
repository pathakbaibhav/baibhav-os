// Every project, in display order. `num` must match the position; Spotlight,
// the terminal and the Projects app all key off it.

export type ProjectCategory = "Backend" | "Hardware & ML" | "IoT" | "Full-stack";
export type ProjectStatus = "Live" | "Completed" | "In progress";

export type CaseStudy = {
  meta: string;
  headline: string;
  demo?: string;
  /** Screenshots or photos, shown as a gallery; the first one large. */
  media?: { src: string; alt: string; caption: string; w: number; h: number }[];
  results: { v: string; l: string; c?: string }[];
  overview: string;
  architecture: { name: string; sub: string; highlight?: boolean }[];
  story: { h: string; p: string }[];
  /** One honest dead end; the box is hidden when absent. */
  deadEnd?: string;
  builtWith: string[];
};

export type Project = {
  num: string;
  slug: string;
  title: string;
  cat: ProjectCategory;
  year: string;
  status: ProjectStatus;
  featured: boolean;
  hue: string;
  tagline: string;
  desc: string;
  metrics: { v: string; l: string }[];
  stack: string[];
  source?: string;
  caseStudy?: CaseStudy;
};

export const PROJECTS: Project[] = [
  {
    num: "01",
    slug: "asl-engine",
    title: "Real-Time ASL Gesture Engine",
    cat: "Backend",
    year: "2024",
    status: "Live",
    featured: true,
    hue: "#F4A766",
    tagline: "A Flask API that reads sign language in under 3 ms.",
    desc: "Random Forest + TensorFlow ensemble on MediaPipe hand landmarks, scaled with dynamic micro-batching, multi-process gunicorn and a thread-safe LRU cache.",
    metrics: [
      { v: "2.7 ms", l: "median inference" },
      { v: "3.5×", l: "443 → 1,569 req/s" },
    ],
    stack: ["Python", "Flask", "TensorFlow", "MediaPipe", "gunicorn"],
    source: "https://github.com/pathakbaibhav/ASL-Interpretation-And-Learning-Tool",
    caseStudy: {
      meta: "Mar – Apr 2024 · solo · Backend & ML",
      headline: "A Flask API that reads American Sign Language in under 3 ms, and keeps doing it at 1,500+ requests a second.",
      demo: "https://pathakbaibhav.github.io/ASL-Interpretation-And-Learning-Tool/",
      media: [
        { src: "/images/projects/asl-live.webp", alt: "The ASL Interpreter web app with a camera panel, detected letter, confidence gauge and translation box", caption: "The live demo: translate and practice modes, running entirely in the browser.", w: 1440, h: 900 },
      ],
      results: [
        { v: "2.7 ms", l: "median inference", c: "per request, single client" },
        { v: "100%", l: "held-out accuracy", c: "across 27 classes" },
        { v: "3.5×", l: "throughput", c: "443 → 1,569 req/s at 32 clients" },
        { v: "−57%", l: "p95 latency", c: "after micro-batching" },
      ],
      overview:
        "The browser captures hand landmarks with MediaPipe and posts 21 normalised (x, y, z) points to a Flask service. A Random Forest and a small TensorFlow network vote on one of 27 classes. Under load, requests are micro-batched so the models run once per batch window instead of once per request.",
      architecture: [
        { name: "Browser", sub: "MediaPipe hands" },
        { name: "gunicorn ×N", sub: "Flask workers" },
        { name: "Micro-batcher", sub: "+ LRU cache", highlight: true },
        { name: "RF + TF", sub: "ensemble vote" },
      ],
      story: [
        {
          h: "Left-handed signers broke it first.",
          p: "The first model did well on my own hand and scored 54% on left-handed signing. Normalising landmarks to the wrist and augmenting with mirrored and scaled samples took that to 100% on the held-out set. A low-light fallback doubled hand detection in dark frames.",
        },
        {
          h: "Then 32 clients at once broke it again.",
          p: "Per-request inference capped out at 443 req/s. Dynamic micro-batching, multi-process workers and a thread-safe LRU cache brought it to 1,569 req/s and cut p95 latency by 57%.",
        },
      ],
      builtWith: ["Python", "Flask", "TensorFlow", "scikit-learn", "MediaPipe", "OpenCV", "gunicorn", "JavaScript", "HTML5", "CSS3", "GitHub Actions · 61 tests"],
    },
  },
  {
    num: "02",
    slug: "subway-optimizer",
    title: "Boston Subway Route Optimizer",
    cat: "Backend",
    year: "2024",
    status: "Live",
    featured: true,
    hue: "#7FD4E8",
    tagline: "Fastest MBTA routes, rerouted around live closures.",
    desc: "FastAPI service modelling 125 stations as a graph, Dijkstra across 7,750 pairs, and a pipeline that turns live service alerts into validated JSON.",
    metrics: [
      { v: "9×", l: "faster than the matrix version" },
      { v: "77%", l: "route cache hit rate" },
    ],
    stack: ["Python", "FastAPI", "BeautifulSoup", "p5.js"],
    source: "https://github.com/pathakbaibhav/Boston-Subway-Network-Visualization",
    caseStudy: {
      meta: "Feb – Mar 2024, revisited Oct 2026 · solo · Backend & data",
      headline: "Fastest routes across Boston's 125 subway stations, rerouted automatically around live service closures.",
      demo: "https://pathakbaibhav.github.io/Boston-Subway-Network-Visualization/",
      media: [
        { src: "/images/projects/subway-route.webp", alt: "Subway map with a highlighted trip from Alewife to Heath Street on the Red and Green lines", caption: "A live trip: Alewife to Heath Street, 50 minutes with one transfer.", w: 1180, h: 860 },
        { src: "/images/projects/subway-reroute.webp", alt: "The same map after a Red Line service change, with the trip rerouted through Haymarket", caption: "A service change arrives and the trip reroutes around it.", w: 1180, h: 860 },
        { src: "/images/projects/subway-planned.webp", alt: "A trip planned for a future date, routed around a scheduled Green Line shutdown", caption: "Planning ahead: a future trip routed around a scheduled shutdown.", w: 1180, h: 860 },
      ],
      results: [
        { v: "9×", l: "faster routing", c: "Dijkstra on an adjacency list vs the original matrix" },
        { v: "7,750", l: "station pairs", c: "fastest route computed for every pair" },
        { v: "−62%", l: "graph memory", c: "adjacency matrix → adjacency list" },
        { v: "77%", l: "cache hit rate", c: "LRU cache on frequently requested routes" },
      ],
      overview:
        "A FastAPI service models the MBTA subway as a graph of 125 stations and answers fastest-route requests with Dijkstra's algorithm. A data pipeline combines the MBTA V3 REST API with a BeautifulSoup scraper of live service alerts, turns the unstructured alert text into validated JSON and CSV, and removes closed segments so trips route around them. An interactive map in Processing (py5 on desktop, p5.js on the web) redraws routes live as service changes.",
      architecture: [
        { name: "MBTA V3 API", sub: "+ alert scraper" },
        { name: "Validator", sub: "JSON / CSV schemas" },
        { name: "Graph + Dijkstra", sub: "adjacency list", highlight: true },
        { name: "LRU cache", sub: "hot routes" },
        { name: "FastAPI + map", sub: "p5.js on Pages" },
      ],
      story: [
        {
          h: "The first version didn't scale past a toy map.",
          p: "Routing on an adjacency matrix worked, but it was slow and wasteful for a sparse network like a subway. Switching to an adjacency list made Dijkstra run in O(E log V): 9× faster, with 62% less memory for the graph.",
        },
        {
          h: "Then the real network had closures.",
          p: "Service alerts arrive as free text, so a BeautifulSoup scraper pulls them and a validation step turns them into structured JSON and CSV. Closed segments drop out of the graph and trips reroute automatically. A scheduled GitHub Actions pipeline keeps the data fresh, and an LRU cache answers 77% of popular route requests without recomputing.",
        },
      ],
      builtWith: ["Python", "FastAPI", "BeautifulSoup", "MBTA V3 API", "Dijkstra", "py5", "p5.js", "GitHub Actions", "GitHub Pages"],
    },
  },
  {
    num: "03",
    slug: "vit-soc",
    title: "Vision Transformer SoC",
    cat: "Hardware & ML",
    year: "2025",
    status: "Completed",
    featured: true,
    hue: "#A78BFA",
    tagline: "A ViT squeezed onto an edge chip.",
    desc: "C++ and SystemC image classifier with parallel patch embeddings and fixed-point arithmetic, checked with FPGA feasibility studies.",
    metrics: [
      { v: "−30%", l: "inference latency" },
      { v: "FPGA", l: "feasibility validated" },
    ],
    stack: ["C++", "SystemC", "FPGA"],
    source: "https://github.com/pathakbaibhav/Project-VIT-SystemC",
    caseStudy: {
      meta: "Nov – Dec 2025 · team project · Hardware/software co-design",
      headline: "A Vision Transformer image classifier modelled as a system-on-chip, made 30% faster for edge hardware.",
      results: [
        { v: "−30%", l: "inference latency", c: "parallel patch embedding + fixed-point maths" },
        { v: "FPGA", l: "feasibility studied", c: "throughput and resource use" },
        { v: "3", l: "modular stages", c: "patch embedding, transformer blocks, MLP head" },
        { v: "Fixed-point", l: "arithmetic", c: "accuracy kept high on constrained hardware" },
      ],
      overview:
        "The classifier is built in C++ and SystemC as separate hardware modules: patch embedding, transformer blocks and an MLP classifier head. Patch embeddings run in parallel and the maths moves to fixed point, so the design fits the constraints of edge hardware while keeping accuracy high. FPGA feasibility studies measured throughput and resource use to set performance targets for real-time edge AI.",
      architecture: [
        { name: "Image", sub: "split into patches" },
        { name: "Patch embedding", sub: "parallel, fixed-point", highlight: true },
        { name: "Transformer blocks", sub: "attention + MLP" },
        { name: "MLP head", sub: "class scores" },
      ],
      story: [
        {
          h: "A transformer is a lot of model for a small chip.",
          p: "Vision Transformers do well on images but lean on wide floating-point maths. Splitting the model into SystemC modules made each stage something that could be timed, parallelised and sized on its own.",
        },
        {
          h: "Parallel patches and fixed-point maths cut latency by 30%.",
          p: "Patch embeddings are independent, so they run in parallel; moving to fixed-point arithmetic made each operation cheaper in hardware. FPGA feasibility studies then measured throughput and resource use to show where the design could run in real time.",
        },
      ],
      builtWith: ["C++", "SystemC", "Vision Transformer", "Edge AI", "Fixed-point arithmetic", "FPGA feasibility study"],
    },
  },
  {
    num: "04",
    slug: "cellular-drone",
    title: "Cellular-Connected Drone",
    cat: "IoT",
    year: "2020",
    status: "Completed",
    featured: false,
    hue: "#6EE7B7",
    tagline: "A quadcopter that flies on cell towers, not RF range.",
    desc: "Arduino C++ and Python quadcopter with IMU, GPS, barometer and camera over SPI, I2C and UART, streaming telemetry over TCP and UDP.",
    metrics: [
      { v: "+30%", l: "range beyond RF links" },
      { v: "−25%", l: "sensor response time" },
    ],
    stack: ["C++", "Python", "Arduino", "TCP/UDP"],
    caseStudy: {
      meta: "Nov 2019 – Mar 2020 · solo · Embedded & IoT",
      headline: "An autonomous quadcopter that routes its link over cell towers, flying 30% further than a traditional RF link allows.",
      results: [
        { v: "+30%", l: "operational range", c: "cellular routing vs traditional RF links" },
        { v: "−25%", l: "sensor response time", c: "after optimising low-level data acquisition" },
        { v: "4", l: "sensors fused", c: "IMU, GPS, barometer, camera" },
        { v: "TCP + UDP", l: "telemetry channels", c: "live video and sensor data" },
      ],
      overview:
        "An autonomous quadcopter built with Arduino C++ and Python. Instead of a direct radio link, it routes its connection over the cellular network, which extends its range by 30%. IMU, GPS, barometer and camera are integrated over SPI, I2C and UART, and bidirectional TCP/IP and UDP channels stream live aerial video and sensor telemetry to a ground control system in real time.",
      architecture: [
        { name: "Sensors", sub: "IMU · GPS · baro · camera" },
        { name: "Arduino", sub: "SPI · I2C · UART" },
        { name: "Python", sub: "control + telemetry" },
        { name: "Cellular link", sub: "tower routing", highlight: true },
        { name: "Ground control", sub: "TCP / UDP" },
      ],
      story: [
        {
          h: "RF range was the ceiling.",
          p: "A traditional radio link limits how far a drone can fly from its controller. Routing the link through cellular towers instead extended the operational range by 30%.",
        },
        {
          h: "Four sensors on three buses, all in real time.",
          p: "The IMU, GPS, barometer and camera talk over SPI, I2C and UART. Optimising the low-level data acquisition cut signal response time by 25%, and separate TCP/IP and UDP channels carry live video and telemetry to the ground.",
        },
      ],
      builtWith: ["Arduino C++", "Python", "SPI", "I2C", "UART", "TCP/IP", "UDP", "Cellular networking"],
    },
  },
  {
    num: "05",
    slug: "baibhav-os",
    title: "baibhavOS (this site)",
    cat: "Full-stack",
    year: "2026",
    status: "In progress",
    featured: true,
    hue: "#5B8CFF",
    tagline: "My portfolio, built as a small operating system that runs in the browser.",
    desc: "A Next.js and TypeScript desktop with a window manager, 12 apps, a terminal that runs my subway route engine on live MBTA alerts, and a phone layout on the same window store.",
    metrics: [
      { v: "12", l: "apps in one window manager" },
      { v: "90+", l: "tests in CI" },
    ],
    stack: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Zustand"],
    source: "https://github.com/pathakbaibhav/baibhav-os",
    caseStudy: {
      meta: "Oct 2026 – present · solo · Full-stack",
      headline: "A portfolio that boots like an operating system: windows, a dock, a working terminal and live data, on desktop and on a phone.",
      media: [
        { src: "/images/projects/os-about.webp", alt: "The baibhavOS desktop with the About Me window open over the code-pane wallpaper", caption: "The desktop: macOS-style menu bar, dock and glass windows over a 3D code-pane wallpaper.", w: 1440, h: 900 },
        { src: "/images/projects/os-projects.webp", alt: "The Projects app with a filterable index on the left and a project preview on the right", caption: "Projects: a filterable index with a preview, and a full case study one click away.", w: 1440, h: 900 },
        { src: "/images/projects/os-resume.webp", alt: "The Resume app with Read and PDF tabs, a section rail and the experience list", caption: "Resume: a readable version and the PDF, side by side in one app.", w: 1440, h: 900 },
      ],
      results: [
        { v: "12", l: "apps", c: "About, Projects, Resume, Skills, Terminal, Lab and more" },
        { v: "90+", l: "automated tests", c: "unit tests plus smoke tests that render the whole OS" },
        { v: "7,750", l: "routes in the browser", c: "my subway engine, ported to TypeScript, on live alerts" },
        { v: "0", l: "cookies or trackers", c: "settings stay in the visitor's browser" },
      ],
      overview:
        "Every part of a resume is an app here: windows open, drag, snap and minimise; Spotlight searches apps, projects, skills and actions; and every window has its own URL, so a case study can be linked to directly and read by search engines. On a phone the same OS becomes a home screen, with apps that open full screen and work with the phone's back gesture.",
      architecture: [
        { name: "Next.js pages", sub: "prerendered, one URL per app" },
        { name: "Window store", sub: "Zustand, desktop + phone", highlight: true },
        { name: "12 apps", sub: "data-driven content" },
        { name: "API routes", sub: "MBTA, GitHub, contact (cached)" },
      ],
      story: [
        {
          h: "One window store for desktop and phone.",
          p: "The phone layout first kept its own idea of which app was open, so links between apps silently did nothing on phones. Moving both layouts onto the same window store fixed every link at once and gave the phone proper back navigation, tied to the browser's history.",
        },
        {
          h: "Live data without a server to babysit.",
          p: "The terminal and the Lab run my subway route engine, ported from Python to TypeScript, in the visitor's browser. Live MBTA alerts and GitHub data come through small cached API routes, so every visitor shares one upstream request and the site stays fast.",
        },
      ],
      builtWith: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS 4", "Zustand", "Vitest", "Testing Library", "GitHub Actions"],
    },
  },
];

export const PROJECT_FILTERS = ["Featured", "Backend", "Full-stack", "Hardware & ML", "IoT", "All"] as const;
export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

export function filterProjects(list: Project[], filter: ProjectFilter): Project[] {
  if (filter === "All") return list;
  if (filter === "Featured") return list.filter((p) => p.featured);
  return list.filter((p) => p.cat === filter);
}
