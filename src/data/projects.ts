// Every project, in display order. `num` must match the position; Spotlight,
// the terminal and the Projects app all key off it.

export type ProjectCategory = "Backend" | "Hardware & ML" | "IoT";
export type ProjectStatus = "Live" | "Completed" | "In progress";

export type CaseStudy = {
  meta: string;
  headline: string;
  demo?: string;
  demoAlt: string;
  results: { v: string; l: string; c?: string }[];
  overview: string;
  architecture: { name: string; sub: string; highlight?: boolean }[];
  story: { h: string; p: string }[];
  deadEnd: string;
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
    source: "https://github.com/pathakbaibhav/ASL-Learning-Platform",
    caseStudy: {
      meta: "Mar – Apr 2024 · solo build · Backend & ML",
      headline: "A Flask API that reads American Sign Language in under 3 ms, and keeps doing it at 1,500+ requests a second.",
      demoAlt: "[ 10-second demo GIF: signing \"HELLO\" in practice mode ]",
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
      deadEnd: "[One honest dead end, e.g. a batch window so long it hurt single-user latency, and how you found the right size.]",
      builtWith: ["Python", "Flask", "TensorFlow", "scikit-learn", "MediaPipe", "OpenCV", "gunicorn", "JavaScript", "GitHub Actions · 61 tests"],
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
  },
];

export const PROJECT_FILTERS = ["Featured", "Backend", "Hardware & ML", "IoT", "All"] as const;
export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

export function filterProjects(list: Project[], filter: ProjectFilter): Project[] {
  if (filter === "All") return list;
  if (filter === "Featured") return list.filter((p) => p.featured);
  return list.filter((p) => p.cat === filter);
}
