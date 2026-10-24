// Work and education, newest first. Read by the Resume app and the terminal.

export type Job = {
  id: string;
  company: string;
  role: string;
  location: string;
  dates: string;
  bullets: string[];
  tags: string[];
};

export const JOBS: Job[] = [
  {
    id: "ipserlabs",
    company: "IpserLabs",
    role: "Software Engineer",
    location: "Boston, USA",
    dates: "Sep 2025 – Jul 2026",
    bullets: [
      "Built control-plane backend services in Python and Go supporting 1K+ daily active users.",
      "Designed secure REST APIs with JWT authentication and role-based access control for registration, resource configuration and interaction workflows.",
      "Automated CI/CD with GitHub workflows, cutting deployment time by 20% across staging and production.",
    ],
    tags: ["Python", "Go", "REST", "JWT / RBAC", "GitHub Actions"],
  },
  {
    id: "ppd",
    company: "PPD (Thermo Fisher)",
    role: "Software Engineer, Backend & Automation",
    location: "Bangalore, India",
    dates: "Jan 2021 – Aug 2023",
    bullets: [
      "Shipped 50+ automation solutions in Python, PowerShell and shell, used by 10,000+ people globally.",
      "Built REST APIs and data pipelines on AWS and Azure: +35% data accuracy, +30% operational efficiency.",
      "Led Azure SQL extraction via Microsoft Graph API; ran Jenkins CI/CD; 95% resolution rate at third-level support.",
      "Mentored junior engineers and worked directly with 200+ end users across macOS and Windows.",
    ],
    tags: ["Python", "PowerShell", "AWS", "Azure", "Jenkins", "Graph API"],
  },
];

export const EDUCATION: { school: string; degree: string; dates: string }[] = [
  { school: "Northeastern University", degree: "M.S. Internet of Things", dates: "Aug 2023 – May 2025" },
  { school: "Visvesvaraya Technological University", degree: "B.Tech Computer Science", dates: "Aug 2016 – Sep 2020" },
];
