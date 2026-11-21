// Whisper Gallery — procedural sound.
// One job: every beep, footstep and sting, made with WebAudio only.

export function createSoundBank() {
  return {
    context: null,
    muted: false,
    enabled: true,
  };
}

export function ensureAudio(bank) {
  if (bank.context || typeof window === "undefined") {
    return;
  }
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      bank.enabled = false;
      return;
    }
    bank.context = new AudioContextClass();
  } catch (error) {
    bank.enabled = false;
  }
}

export function resumeAudio(bank) {
  ensureAudio(bank);
  if (bank.context && bank.context.state === "suspended") {
    bank.context.resume().catch(() => {});
  }
}

export function playTone(bank, frequency, duration, wave, volume, when) {
  if (!bank.enabled || bank.muted || !bank.context) {
    return;
  }
  try {
    const startAt = bank.context.currentTime + (when || 0);
    const oscillator = bank.context.createOscillator();
    const gain = bank.context.createGain();
    oscillator.type = wave || "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(volume || 0.08, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(bank.context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  } catch (error) {
    bank.enabled = false;
  }
}

export function playPickup(bank) {
  playTone(bank, 880, 0.14, "sine", 0.09, 0);
  playTone(bank, 1318, 0.2, "sine", 0.07, 0.09);
}

export function playAlert(bank) {
  playTone(bank, 196, 0.22, "sawtooth", 0.07, 0);
  playTone(bank, 147, 0.3, "sawtooth", 0.07, 0.16);
}

export function playChase(bank) {
  playTone(bank, 110, 0.18, "square", 0.06, 0);
  playTone(bank, 165, 0.18, "square", 0.06, 0.14);
  playTone(bank, 110, 0.18, "square", 0.06, 0.28);
}

export function playStep(bank, loud) {
  playTone(bank, loud ? 120 : 90, 0.05, "triangle", loud ? 0.035 : 0.018, 0);
}

export function playWin(bank) {
  playTone(bank, 523, 0.16, "sine", 0.09, 0);
  playTone(bank, 659, 0.16, "sine", 0.09, 0.14);
  playTone(bank, 784, 0.16, "sine", 0.09, 0.28);
  playTone(bank, 1046, 0.34, "sine", 0.09, 0.42);
}

export function playLose(bank) {
  playTone(bank, 220, 0.3, "sawtooth", 0.07, 0);
  playTone(bank, 110, 0.55, "sawtooth", 0.07, 0.24);
}

export function playUnlock(bank) {
  playTone(bank, 392, 0.12, "sine", 0.08, 0);
  playTone(bank, 587, 0.2, "sine", 0.08, 0.1);
}
