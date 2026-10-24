import { JOBS } from "@/data/experience";
import { PROJECTS, type Project } from "@/data/projects";
import type { Job } from "@/data/experience";

// "Where have I used this?" for every skill, worked out from the jobs' tags
// and the projects' stacks, so the Skills app can never claim more than the
// rest of the portfolio shows.

/** "AWS (EC2, S3, Lambda)" → "aws", "JWT / RBAC" → "jwt", "GitHub Actions · 61 tests" → "github actions". */
export function baseName(s: string): string {
  return s.split(/ \(| · | \/ /)[0].trim().toLowerCase();
}

const projectTerms = (p: Project) => [...p.stack, ...(p.caseStudy?.builtWith ?? [])].map(baseName);

export type Usage = { jobs: Job[]; projects: Project[] };

export function usageOf(skill: string): Usage {
  const key = baseName(skill);
  return {
    jobs: JOBS.filter((j) => j.tags.map(baseName).includes(key)),
    projects: PROJECTS.filter((p) => projectTerms(p).includes(key)),
  };
}
