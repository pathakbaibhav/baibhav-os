// Work and education, newest first. Read by the Resume app and the terminal.

export const RESUME_SUMMARY =
  "Senior Software Engineer specialising in backend systems, automation platforms and API development with Python, C++, Node.js and cloud technologies. Experienced in building scalable services, CI/CD workflows and data pipelines with cross-functional teams, delivering reliable, maintainable software.";

/** The one-page PDF (built from scripts/resume/resume.html with `npm run resume`). */
export const RESUME_PDF: string | null = "/resume.pdf";

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
    id: "zoppler",
    company: "Zoppler Systems",
    role: "Senior Software Engineer",
    location: "Bangalore, India",
    dates: "Oct 2026 – Present",
    bullets: [], // coming later
    tags: ["C++", "Python"],
  },
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
      "Built and deployed 50+ backend automation solutions in Python, PowerShell and shell scripting, serving 10,000+ users globally and owning features end to end, from design through deployment and maintenance.",
      "Developed scalable REST APIs and data processing pipelines on AWS and Azure with QA, operations and 200+ end users, improving data accuracy by 35% and operational efficiency by 30%.",
      "Led data extraction from Azure SQL Database via Microsoft Graph API, building custom Python and PowerShell tooling for data-driven decisions across the organisation.",
      "Implemented CI/CD pipelines with Jenkins and automated deployment workflows, simplifying codebases to speed up development and keeping a 95% problem resolution rate at third-level support.",
      "Mentored junior engineers and worked directly with 200+ end users to find pain points, iterating on backend solutions and integrating them across macOS and Windows enterprise environments.",
    ],
    tags: ["Python", "PowerShell", "Shell", "AWS", "Azure", "Azure SQL", "Jenkins", "Microsoft Graph API"],
  },
];

export const EDUCATION: { school: string; degree: string; dates: string }[] = [
  { school: "Northeastern University", degree: "M.S. Internet of Things", dates: "Aug 2023 – May 2025" },
  { school: "Visvesvaraya Technological University", degree: "B.Tech Computer Science", dates: "Aug 2016 – Sep 2020" },
];
