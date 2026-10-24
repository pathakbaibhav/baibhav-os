"use client";

import { PROFILE } from "@/data/profile";
import { btnGhost, btnSolid } from "./ui";

export function Contact() {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-8 py-8">
      <div className="eyebrow">Contact</div>
      <h1 className="text-[28px] font-extrabold leading-tight">Let&apos;s build something that stays up.</h1>
      <p className="text-[15px] leading-relaxed text-fg2">
        I&apos;m open to backend, platform and SWE roles. Email is the fastest way to reach me.
      </p>
      <dl className="font-mono text-[13px]">
        {[
          ["email", PROFILE.email, `mailto:${PROFILE.email}`],
          ["github", "/pathakbaibhav", PROFILE.github],
          ["linkedin", "/baibhavkp", PROFILE.linkedin],
        ].map(([k, v, href]) => (
          <div key={k} className="flex gap-4 border-t border-hair py-2.5">
            <dt className="w-20 text-muted">{k}</dt>
            <dd>
              <a href={href} target={k === "email" ? undefined : "_blank"} rel="noreferrer" className="text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
                {v}
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex flex-wrap gap-2.5">
        <a href={`mailto:${PROFILE.email}`} className={btnSolid}>Email me</a>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className={btnGhost}>LinkedIn ↗</a>
      </div>
    </div>
  );
}
