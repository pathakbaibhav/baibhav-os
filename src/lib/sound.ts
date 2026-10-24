// Interface sounds, synthesised with Web Audio so there are no files to load.
// Callers decide whether sound is on; this module only knows how to play.

export type Sound = "open" | "close" | "minimize" | "toggle";

// [start Hz, end Hz, duration s]
const TONES: Record<Sound, [number, number, number]> = {
  open: [520, 880, 0.09],
  close: [660, 330, 0.08],
  minimize: [600, 260, 0.14],
  toggle: [740, 740, 0.05],
};

let ctx: AudioContext | null = null;

export function play(sound: Sound): void {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;
  try {
    ctx ??= new AudioContext();
    const [from, to, dur] = TONES[sound];
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // Audio is a nicety; never let it break the OS.
  }
}
