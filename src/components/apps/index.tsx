"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { APPS, type AppId } from "@/lib/apps";
import { PROJECTS } from "@/data/projects";
import type { Win } from "@/lib/windows";
import type { AppProps } from "./ui";

// Each app is its own chunk, fetched when its window first opens.
const About = dynamic<AppProps>(() => import("./About").then((m) => m.About));
const Arcade = dynamic<AppProps>(() => import("./Arcade").then((m) => m.Arcade));
const Contact = dynamic<AppProps>(() => import("./Contact").then((m) => m.Contact));
const GitHub = dynamic<AppProps>(() => import("./GitHub").then((m) => m.GitHub));
const Help = dynamic<AppProps>(() => import("./Help").then((m) => m.Help));
const Lab = dynamic<AppProps>(() => import("./Lab").then((m) => m.Lab));
const Projects = dynamic<AppProps>(() => import("./Projects").then((m) => m.Projects));
const Resume = dynamic<AppProps>(() => import("./Resume").then((m) => m.Resume));
const Settings = dynamic<AppProps>(() => import("./Settings").then((m) => m.Settings));
const Skills = dynamic<AppProps>(() => import("./Skills").then((m) => m.Skills));
const Terminal = dynamic<AppProps>(() => import("./Terminal").then((m) => m.Terminal));
const Writing = dynamic<AppProps>(() => import("./Writing").then((m) => m.Writing));

const REGISTRY: Record<AppId, ComponentType<AppProps>> = {
  about: About,
  projects: Projects,
  resume: Resume,
  skills: Skills,
  terminal: Terminal,
  help: Help,
  settings: Settings,
  lab: Lab,
  contact: Contact,
  github: GitHub,
  writing: Writing,
  arcade: Arcade,
};

export function AppContent({ id, ...props }: AppProps & { id: AppId }) {
  const C = REGISTRY[id];
  return <C {...props} />;
}

export function windowTitle(win: Pick<Win, "id" | "params">): string {
  if (win.id === "projects" && win.params.view === "case") {
    const p = PROJECTS.find((x) => x.num === win.params.sel);
    if (p) return `~/projects/${p.slug}`;
  }
  if (win.id === "writing" && win.params.post) return `~/writing/${win.params.post}`;
  if (win.id === "terminal") return "baibhav@os — zsh";
  return APPS[win.id].label;
}
