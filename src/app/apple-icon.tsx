import { ImageResponse } from "next/og";
import { MARK } from "@/lib/og";

// Home-screen icon for iOS: the OS mark on the desktop's dark gradient.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #1E2338, #06070D)" }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#7FD4E8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={MARK} />
        </svg>
      </div>
    ),
    size,
  );
}
