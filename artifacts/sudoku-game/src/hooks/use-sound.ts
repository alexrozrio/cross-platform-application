import { useRef, useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sudoku-sound-enabled';

// Module-level: tracks whether the user explicitly toggled sound this session.
// While non-null it takes priority over the profile setting so navigating
// between games doesn't reset the mute the user just chose.
let sessionOverride: boolean | null = null;

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
}

type OscType = 'sine' | 'square' | 'triangle' | 'sawtooth';

function playTone(
  freq: number,
  duration: number,
  type: OscType = 'sine',
  volume = 0.3,
  startOffset = 0,
  ctx?: AudioContext,
) {
  const ac = ctx ?? getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + startOffset);
  gain.gain.setValueAtTime(0, ac.currentTime + startOffset);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + startOffset + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + duration);
  osc.start(ac.currentTime + startOffset);
  osc.stop(ac.currentTime + startOffset + duration + 0.01);
}

// ── Individual sound definitions ────────────────────────────────────────

function soundClick() {
  playTone(520, 0.05, 'sine', 0.15);
}

function soundPlace() {
  const ac = getCtx();
  playTone(523, 0.12, 'sine', 0.25, 0,    ac);
  playTone(659, 0.14, 'sine', 0.25, 0.08, ac);
}

function soundNote() {
  playTone(700, 0.04, 'triangle', 0.12);
}

function soundError() {
  const ac = getCtx();
  playTone(200, 0.08, 'square', 0.2, 0,    ac);
  playTone(160, 0.10, 'square', 0.2, 0.07, ac);
}

function soundErase() {
  playTone(350, 0.06, 'triangle', 0.12);
}

function soundComplete() {
  const ac = getCtx();
  const seq = [523, 659, 784, 1047];
  seq.forEach((freq, i) => playTone(freq, 0.18, 'sine', 0.35, i * 0.13, ac));
}

function soundGameOver() {
  const ac = getCtx();
  playTone(392, 0.22, 'triangle', 0.28, 0,    ac);
  playTone(330, 0.22, 'triangle', 0.28, 0.22, ac);
  playTone(262, 0.35, 'triangle', 0.28, 0.44, ac);
}

// ── Hook ────────────────────────────────────────────────────────────────

export function useSound(profileEnabled?: boolean) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    // Session override wins (user toggled during this page session)
    if (sessionOverride !== null) return sessionOverride;
    // Profile setting from backend is next
    if (profileEnabled !== undefined) return profileEnabled;
    // Fall back to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const enabledRef = useRef(enabled);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  useEffect(() => {
    // Only let the profile setting apply if the user hasn't explicitly
    // toggled this session — otherwise we'd undo their in-session mute.
    if (profileEnabled !== undefined && sessionOverride === null) {
      setEnabled(profileEnabled);
      try { localStorage.setItem(STORAGE_KEY, String(profileEnabled)); } catch {}
    }
  }, [profileEnabled]);

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      sessionOverride = next;                                   // persist for this session
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const play = useCallback((fn: () => void) => {
    if (!enabledRef.current) return;
    try { fn(); } catch {}
  }, []);

  return {
    enabled,
    toggle,
    click:    () => play(soundClick),
    place:    () => play(soundPlace),
    note:     () => play(soundNote),
    error:    () => play(soundError),
    erase:    () => play(soundErase),
    complete: () => play(soundComplete),
    gameover: () => play(soundGameOver),
  };
}
