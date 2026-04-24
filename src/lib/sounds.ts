// Web Audio procedural sound system — no external files.
// Generates click, dice, win, lose, capture sounds + ambient music.

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function readSettings() {
  try {
    const raw = localStorage.getItem("game-settings");
    const s = raw ? JSON.parse(raw) : {};
    return {
      soundEnabled: s.soundEnabled ?? true,
      soundVolume: (s.soundVolume ?? 70) / 100,
      musicEnabled: s.musicEnabled ?? true,
      musicVolume: (s.musicVolume ?? 50) / 100,
    };
  } catch {
    return { soundEnabled: true, soundVolume: 0.7, musicEnabled: true, musicVolume: 0.5 };
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.3, attack = 0.005, release = 0.05) {
  const c = getCtx(); if (!c) return;
  const { soundEnabled, soundVolume } = readSettings();
  if (!soundEnabled) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = c.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(vol * soundVolume, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(g); g.connect(c.destination);
  osc.start(now);
  osc.stop(now + dur + release);
}

function noise(dur: number, vol = 0.2) {
  const c = getCtx(); if (!c) return;
  const { soundEnabled, soundVolume } = readSettings();
  if (!soundEnabled) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = vol * soundVolume;
  const f = c.createBiquadFilter();
  f.type = "highpass"; f.frequency.value = 800;
  src.connect(f); f.connect(g); g.connect(c.destination);
  src.start();
}

export const sfx = {
  click: () => tone(600, 0.08, "triangle", 0.18),
  move: () => tone(440, 0.1, "sine", 0.22),
  capture: () => { tone(220, 0.12, "sawtooth", 0.25); setTimeout(() => tone(160, 0.18, "sawtooth", 0.2), 60); },
  dice: () => { noise(0.25, 0.25); setTimeout(() => tone(800 + Math.random() * 200, 0.06, "square", 0.15), 200); },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.25, "triangle", 0.3), i * 120));
  },
  lose: () => {
    [400, 320, 240].forEach((f, i) => setTimeout(() => tone(f, 0.3, "sawtooth", 0.25), i * 150));
  },
  check: () => tone(880, 0.2, "square", 0.2),
};

// ---- Ambient background music (slow arpeggio loop) ----
let musicNodes: { osc: OscillatorNode; gain: GainNode; lfo?: OscillatorNode }[] = [];
let musicInterval: number | null = null;
let musicMaster: GainNode | null = null;

const MELODY: number[] = [
  // Soft pentatonic loop in A minor — calm wood-game feel
  220, 261, 329, 392, 329, 261,
  220, 246, 329, 440, 329, 246,
];

export function startMusic() {
  const { musicEnabled, musicVolume } = readSettings();
  if (!musicEnabled) return;
  const c = getCtx(); if (!c) return;
  if (musicInterval !== null) return; // already playing

  musicMaster = c.createGain();
  musicMaster.gain.value = musicVolume * 0.18;
  musicMaster.connect(c.destination);

  let step = 0;
  const tick = () => {
    if (!c || !musicMaster) return;
    const freq = MELODY[step % MELODY.length];
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const now = c.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.5, now + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.connect(g); g.connect(musicMaster);
    osc.start(now); osc.stop(now + 1);

    // soft bass every 2 steps
    if (step % 2 === 0) {
      const b = c.createOscillator();
      const bg = c.createGain();
      b.type = "triangle";
      b.frequency.value = freq / 2;
      bg.gain.setValueAtTime(0, now);
      bg.gain.linearRampToValueAtTime(0.4, now + 0.1);
      bg.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      b.connect(bg); bg.connect(musicMaster);
      b.start(now); b.stop(now + 1.5);
    }
    step++;
  };
  tick();
  musicInterval = window.setInterval(tick, 600);
}

export function stopMusic() {
  if (musicInterval !== null) { clearInterval(musicInterval); musicInterval = null; }
  if (musicMaster) {
    try { musicMaster.disconnect(); } catch {}
    musicMaster = null;
  }
  musicNodes = [];
}

export function refreshMusicVolume() {
  const { musicEnabled, musicVolume } = readSettings();
  if (!musicEnabled) { stopMusic(); return; }
  if (musicMaster) musicMaster.gain.value = musicVolume * 0.18;
  else startMusic();
}

// Auto-start on first user interaction (browser autoplay policy)
if (typeof window !== "undefined") {
  const kick = () => {
    const { musicEnabled } = readSettings();
    if (musicEnabled) startMusic();
    window.removeEventListener("pointerdown", kick);
    window.removeEventListener("keydown", kick);
  };
  window.addEventListener("pointerdown", kick, { once: false });
  window.addEventListener("keydown", kick, { once: false });
  // React to settings changes from other tabs/components
  window.addEventListener("storage", (e) => {
    if (e.key === "game-settings") refreshMusicVolume();
  });
}
