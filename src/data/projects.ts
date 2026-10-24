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
      meta: "Mar – Apr 2024 · Backend & ML",
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
      meta: "Feb – Mar 2024, revisited Oct 2026 · Backend & data",
      headline: "Fastest routes across Boston's 125 subway stations, rerouted automatically around live service closures.",
      demo: "https://pathakbaibhav.github.io/Boston-Subway-Network-Visualization/",
      demoAlt: "[ 10-second demo GIF: a closure appears and the route redraws around it ]",
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
      deadEnd: "[One honest dead end, e.g. an alert format the parser got wrong, and how you caught it.]",
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
      meta: "Nov – Dec 2025 · Hardware/software co-design",
      headline: "A Vision Transformer image classifier modelled as a system-on-chip, made 30% faster for edge hardware.",
      demoAlt: "[ Diagram or screenshot: the SystemC module graph and a simulation trace ]",
      results: [
        { v: "−30%", l: "inference latency", c: "parallel patch embedding + fixed-point maths" },
        { v: "FPGA", l: "feasibility studied", c: "throughput and resource use" },
        { v: "3", l: "modular stages", c: "patch embedding, transformer blocks, MLP head" },
        { v: "[ % ]", l: "accuracy kept", c: "after fixed-point conversion" },
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
      deadEnd: "[One honest dead end, e.g. a fixed-point width that lost too much accuracy, and how you picked the final one.]",
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
      meta: "Nov 2019 – Mar 2020 · Embedded & IoT",
      headline: "An autonomous quadcopter that routes its link over cell towers, flying 30% further than a traditional RF link allows.",
      demoAlt: "[ Photo or short flight clip of the drone ]",
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
      deadEnd: "[One honest dead end, e.g. latency over the cellular link and how the TCP/UDP split dealt with it.]",
      builtWith: ["Arduino C++", "Python", "SPI", "I2C", "UART", "TCP/IP", "UDP", "Cellular networking"],
    },
  },
];

export const PROJECT_FILTERS = ["Featured", "Backend", "Hardware & ML", "IoT", "All"] as const;
export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

export function filterProjects(list: Project[], filter: ProjectFilter): Project[] {
  if (filter === "All") return list;
  if (filter === "Featured") return list.filter((p) => p.featured);
  return list.filter((p) => p.cat === filter);
}
