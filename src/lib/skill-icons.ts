import {
  siArduino, siC, siCplusplus, siCss, siDocker, siExpress, siFastapi, siFlask, siGit, siGithub, siGithubactions, siGnubash, siGo,
  siHtml5, siJavascript, siJenkins, siJira, siJsonwebtokens, siMediapipe, siMongodb, siMqtt, siMysql, siNextdotjs, siNodedotjs,
  siNumpy, siOpencv, siPostgresql, siPostman, siPython, siRaspberrypi, siReact, siScikitlearn, siTensorflow, siTypescript,
  type SimpleIcon,
} from "simple-icons";

// An icon for every skill in src/data/skills.ts. Brand logos come from Simple Icons
// (CC0); brands whose owners asked Simple Icons to drop their logos (Microsoft,
// Amazon) and generic concepts (SQL, REST, buses, protocols) get a neutral line glyph.

export type SkillIcon =
  | { kind: "brand"; path: string; hex: string; title: string }
  | { kind: "glyph"; path: string };

const BRAND: Record<string, SimpleIcon> = {
  Python: siPython, Go: siGo, JavaScript: siJavascript, TypeScript: siTypescript, "C++": siCplusplus, C: siC, Shell: siGnubash,
  HTML5: siHtml5, CSS3: siCss, "Node.js": siNodedotjs, Express: siExpress, FastAPI: siFastapi, Flask: siFlask, JWT: siJsonwebtokens,
  "Next.js": siNextdotjs, React: siReact, PostgreSQL: siPostgresql, MongoDB: siMongodb, MySQL: siMysql, Docker: siDocker,
  Jenkins: siJenkins, "GitHub Actions": siGithubactions, TensorFlow: siTensorflow, "scikit-learn": siScikitlearn, OpenCV: siOpencv,
  MediaPipe: siMediapipe, NumPy: siNumpy, Arduino: siArduino, "Raspberry Pi": siRaspberrypi, MQTT: siMqtt, Git: siGit, GitHub: siGithub,
  Postman: siPostman, JIRA: siJira,
};

// 24×24 stroke paths, drawn like the OS's other icons.
const G = {
  database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  cloud: "M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 17.9 11.5 3.5 3.5 0 0 1 17.5 18z",
  terminal: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM7 9l3 3-3 3M13 15h4",
  chip: "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4",
  bus: "M3 8h18M3 16h18M7 8v8M12 8v8M17 8v8",
  network: "M10 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0M3 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0M17 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0M12 7v5M12 12l-6.5 5.5M12 12l6.5 5.5",
  api: "M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16",
  code: "M8 6l-5 6 5 6M16 6l5 6-5 6",
  wifi: "M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01",
  layout: "M3 5h12v10H3zM17 8h4v11h-4zM7 19h6",
  gear: "M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  bars: "M4 20h4v-6H4zM10 20h4V9h-4zM16 20h4V4h-4z",
  boxes: "M4 4h7v7H4zM13 13h7v7h-7zM11 7.5h4.5V13",
  check: "M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z",
};

const GLYPH: Record<string, string> = {
  SQL: G.database, "Azure SQL": G.database, PowerShell: G.terminal, SystemC: G.chip, REST: G.api, WebSockets: G.network,
  "Responsive design": G.layout, "AWS (EC2, S3, Lambda)": G.cloud, Azure: G.cloud, SCCM: G.gear, AdminStudio: G.gear,
  "Edge AI": G.chip, UART: G.bus, I2C: G.bus, SPI: G.bus, "TCP/IP": G.network, UDP: G.network, "Wi-Fi": G.wifi,
  "VS Code": G.code, "Microsoft Graph API": G.api, "Data structures & algorithms": G.bars, "Distributed systems": G.network,
  OOP: G.boxes, "Test-driven development": G.check,
};

export function iconFor(skill: string): SkillIcon {
  const b = BRAND[skill];
  if (b) return { kind: "brand", path: b.path, hex: `#${b.hex}`, title: b.title };
  return { kind: "glyph", path: GLYPH[skill] ?? G.code };
}

/** Relative luminance (WCAG), so a brand tile can pick white or dark text and glyph. */
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const hasIcon = (skill: string) => skill in BRAND || skill in GLYPH;
