// Sound cues: short beeps (Web Audio) and spoken cues. In the Android app speech uses the phone's own
// text-to-speech, which keeps working with the screen off during a run; on the web, speechSynthesis.
import { NATIVE } from '../../core/native';

let ctx: AudioContext | null = null;
/** Short beep(s). Fails silently where audio is not available. */
export function beep(times = 1, freq = 880, ms = 140) {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') ctx.resume();
    for (let k = 0; k < times; k++) {
      const t = ctx.currentTime + k * (ms + 90) / 1000;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = freq; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + ms / 1000 + 0.02);
    }
  } catch { /* ignore */ }
}

/** Unlock audio on a user gesture (browsers start audio muted until the user has tapped). */
export function unlockAudio() { beep(1, 440, 1); }

let lastSpoken = 0;
/** Say a short sentence in Swedish. Skips if the previous cue was less than `gapMs` ago. */
export async function speak(text: string, gapMs = 0) {
  const now = Date.now();
  if (now - lastSpoken < gapMs) return;
  lastSpoken = now;
  try {
    if (NATIVE) {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
      await TextToSpeech.speak({ text, lang: 'sv-SE', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'playback' });
      return;
    }
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'sv-SE';
      const sv = speechSynthesis.getVoices().find((v) => v.lang.startsWith('sv'));
      if (sv) u.voice = sv;
      speechSynthesis.speak(u);
    }
  } catch { /* ignore */ }
}

/** Readable pace for speech: "6 minuter 30" per kilometer. */
export const sayPace = (secPerKm: number) => {
  const m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60);
  return s ? `${m} minuter ${s}` : `${m} minuter`;
};
