"use client";

import type { ComponentType } from "react";
import { Icon } from "@/components/Icon";
import { APPS, type AppId } from "@/lib/apps";
import { PROJECTS } from "@/data/projects";
import type { Win } from "@/lib/windows";
import { About } from "./About";
import { Contact } from "./Contact";
import { Help } from "./Help";
import { Lab } from "./Lab";
import { Projects } from "./Projects";
import { Settings } from "./Settings";
import { Terminal } from "./Terminal";
import type { AppProps } from "./ui";

function ComingSoon({ id }: { id: AppId }) {
  const app = APPS[id];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-[18px]"
        style={{ background: `linear-gradient(160deg, ${app.color} 0%, ${app.color}AA 55%, #12151C 140%)` }}
      >
        <Icon d={app.icon} size={30} stroke="#FFFFFF" />
      </span>
      <h1 className="text-xl font-bold">{app.label} is still compiling.</h1>
      <p className="max-w-[340px] text-sm leading-relaxed text-fg2">This app ships in a later build of baibhavOS.</p>
      <p className="font-mono text-xs text-muted">[ coming soon ]</p>
    </div>
  );
}

const REGISTRY: Partial<Record<AppId, ComponentType<AppProps>>> = {
  about: About,
  projects: Projects,
  terminal: Terminal,
  help: Help,
  settings: Settings,
  lab: Lab,
  contact: Contact,
};

export function AppContent({ id, ...props }: AppProps & { id: AppId }) {
  const C = REGISTRY[id];
  return C ? <C {...props} /> : <ComingSoon id={id} />;
}

export function windowTitle(win: Pick<Win, "id" | "params">): string {
  if (win.id === "projects" && win.params.view === "case") {
    const p = PROJECTS.find((x) => x.num === win.params.sel);
    if (p) return `~/projects/${p.slug}`;
  }
  if (win.id === "terminal") return "baibhav@os — zsh";
  return APPS[win.id].label;
}
