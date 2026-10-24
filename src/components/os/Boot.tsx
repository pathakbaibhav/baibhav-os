"use client";

import { useEffect } from "react";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

export function Boot({ onEnter }: { onEnter: () => void }) {
  useEffect(() => {
    const onKey = () => onEnter();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-hidden px-4 font-mono text-[#E6E9F0]"
      style={{ background: "radial-gradient(circle at 50% 38%, #0D1522 0%, #05070B 60%)" }}
    >
      <div className="relative h-[min(400px,80vw)] w-[min(400px,80vw)]">
        <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" style={{ animation: "spin-rev 60s linear infinite" }}>
          <defs>
            <path id="ringpath" d="M200,200 m-172,0 a172,172 0 1,1 344,0 a172,172 0 1,1 -344,0" />
          </defs>
          <text fill="#D7DCE6" fontFamily="var(--font-mono)" fontSize="15" letterSpacing="5">
            <textPath href="#ringpath">systems that ship · scale · and stay up · baibhavOS v1.0 · </textPath>
          </text>
        </svg>
        <div
          className="absolute inset-[15%] rounded-full"
          style={{ background: "#03050A", border: "3px solid #1E3550", boxShadow: "0 0 60px 14px rgba(40,80,120,0.25), inset 0 0 40px rgba(40,80,120,0.25)" }}
        />
        <svg role="img" aria-label="Rotating wireframe tesseract" viewBox="0 0 300 300" className="absolute inset-[15%] h-[70%] w-[70%]" style={{ animation: "spin 40s linear infinite" }}>
          <g transform="translate(150 150) scale(0.78) translate(-155 -145)" stroke="#C9CFDA" strokeWidth="1.6" fill="none" strokeLinejoin="round">
            <path d="M70 100H200V230H70ZM110 60H240V190H110ZM70 100L110 60M200 100L240 60M200 230L240 190M70 230L110 190" />
            <path d="M117 125H175V183H117ZM135 107H193V165H135ZM117 125L135 107M175 125L193 107M175 183L193 165M117 183L135 165" stroke="#9AA3B5" />
            <path d="M70 100L117 125M200 100L175 125M200 230L175 183M70 230L117 183M110 60L135 107M240 60L193 107M240 190L193 165M110 190L135 165" stroke="#7B8496" strokeWidth="1.2" />
          </g>
          <g transform="translate(150 150) scale(0.78) translate(-155 -145)" fill="#FFFFFF">
            {[[70, 100], [200, 100], [200, 230], [70, 230], [110, 60], [240, 60], [240, 190], [110, 190]].map(([cx, cy]) => (
              <circle key={`o${cx}-${cy}`} cx={cx} cy={cy} r="3" />
            ))}
            {[[117, 125], [175, 125], [175, 183], [117, 183], [135, 107], [193, 107], [193, 165], [135, 165]].map(([cx, cy]) => (
              <circle key={`i${cx}-${cy}`} cx={cx} cy={cy} r="2.2" />
            ))}
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold tracking-[0.04em] text-[#B9B2B5]">{PROFILE.name.toUpperCase()}</h1>
        <p className="text-[clamp(12px,1.6vw,17px)] tracking-[0.14em] text-[#7F99BA]">BACKEND · SYSTEMS · IoT · BOSTON</p>
      </div>

      <div className="flex w-[min(360px,100%)] flex-col gap-2.5 text-xs text-[#8792A6]">
        <div>[ ok ] mounting /projects … {PROJECTS.length} found</div>
        <div>[ ok ] starting api.baibhav.dev … 200</div>
        <div className="h-0.5 overflow-hidden rounded bg-[#141B27]">
          <div className="h-0.5 w-full bg-[#7FD4E8]" style={{ animation: "load 2.4s ease-out" }} />
        </div>
      </div>

      <button
        type="button"
        onClick={onEnter}
        autoFocus
        className="mt-2 cursor-pointer rounded-full border border-[#23324A] px-[22px] py-3 text-[13px] tracking-[0.14em] text-[#E6E9F0] hover:border-[#7FD4E8]"
      >
        CLICK OR PRESS ANY KEY TO ENTER
        <span className="text-[#A78BFA]" style={{ animation: "blink 1s steps(1) infinite" }}> _</span>
      </button>
    </div>
  );
}
