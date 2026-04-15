class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = CONFIG.AUDIO_ENABLED;
    this.initialized = false;
    this.musicPlaying = false;
    this.musicGain = null;
    this.musicTimeout = null;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(sound) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    switch (sound) {
      case 'shoot': this._shoot(); break;
      case 'explosion': this._explosion(); break;
      case 'hit': this._hit(); break;
      case 'powerup': this._powerup(); break;
      case 'wave': this._wave(); break;
      case 'gameover': this._gameover(); break;
      case 'select': this._select(); break;
    }
  }

  // --- Musica de fondo ---
  startMusic() {
    if (!this.enabled || !this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    this._playMusicLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  _playMusicLoop() {
    if (!this.musicPlaying || !this.enabled || !this.ctx) return;

    const t = this.ctx.currentTime;

    // Patron de bajo (notas graves en loop)
    const bassNotes = [110, 110, 146.83, 130.81, 110, 110, 164.81, 146.83];
    const noteLen = 0.25;
    const loopLen = bassNotes.length * noteLen;

    // Canal de bajo
    const bassGain = this.ctx.createGain();
    bassGain.connect(this.ctx.destination);
    bassGain.gain.setValueAtTime(0.08, t);

    bassNotes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * noteLen);
      const noteGain = this.ctx.createGain();
      osc.connect(noteGain);
      noteGain.connect(bassGain);
      noteGain.gain.setValueAtTime(0.8, t + i * noteLen);
      noteGain.gain.exponentialRampToValueAtTime(0.01, t + i * noteLen + noteLen * 0.9);
      osc.start(t + i * noteLen);
      osc.stop(t + i * noteLen + noteLen);
    });

    // Melodia aguda (arpegios)
    const melodyNotes = [330, 0, 440, 0, 392, 0, 330, 349];
    const melGain = this.ctx.createGain();
    melGain.connect(this.ctx.destination);
    melGain.gain.setValueAtTime(0.04, t);

    melodyNotes.forEach((freq, i) => {
      if (freq === 0) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * noteLen);
      const noteGain = this.ctx.createGain();
      osc.connect(noteGain);
      noteGain.connect(melGain);
      noteGain.gain.setValueAtTime(0.6, t + i * noteLen);
      noteGain.gain.exponentialRampToValueAtTime(0.01, t + i * noteLen + noteLen * 0.8);
      osc.start(t + i * noteLen);
      osc.stop(t + i * noteLen + noteLen);
    });

    // Hi-hat sintetico (ruido corto cada beat)
    for (let i = 0; i < bassNotes.length; i++) {
      const bufSize = this.ctx.sampleRate * 0.03;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) {
        data[j] = (Math.random() * 2 - 1) * (1 - j / bufSize);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const hGain = this.ctx.createGain();
      src.connect(hGain);
      hGain.connect(this.ctx.destination);
      hGain.gain.setValueAtTime(0.03, t + i * noteLen);
      hGain.gain.exponentialRampToValueAtTime(0.001, t + i * noteLen + 0.03);
      src.start(t + i * noteLen);
    }

    // Programar siguiente loop
    this.musicTimeout = setTimeout(() => {
      this._playMusicLoop();
    }, loopLen * 1000 - 50);
  }

  // --- Efectos de sonido ---
  _shoot() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.08);
  }

  _explosion() {
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    source.start(this.ctx.currentTime);
  }

  _hit() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.03);
  }

  _powerup() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.2);
  }

  _wave() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(784, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.3);
  }

  _gameover() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.8);
  }

  _select() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.1);
  }
}
