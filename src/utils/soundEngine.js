// Web Audio API Sound Chime Generator for TakMan
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playCompletionBell() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      [659.25, 830.61, 987.77].forEach((freq, i) => { // E5, G#5, B5 chord
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.6);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
