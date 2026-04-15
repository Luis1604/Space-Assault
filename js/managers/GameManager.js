class GameManager {
  constructor() {
    this.state = CONFIG.STATES.MENU;
    this.audio = new AudioManager();
    this.score = new ScoreManager();
    this.waves = new WaveManager();
    this.particles = new ParticleManager();
  }

  init() {
    this.audio.init();
  }

  startGame() {
    this.state = CONFIG.STATES.PLAYING;
    this.score.reset();
    this.waves.reset();
  }

  gameOver() {
    this.state = CONFIG.STATES.GAMEOVER;
    this.score.saveHighScore();
    this.audio.play('gameover');
  }

  isPlaying() {
    return this.state === CONFIG.STATES.PLAYING;
  }

  getCurrentState() {
    return this.state;
  }

  getScore() {
    return this.score.getScore();
  }

  getHighScore() {
    return this.score.getHighScore();
  }

  isNewHighScore() {
    return this.score.newHighScore;
  }

  getCurrentWave() {
    return this.waves.currentWave;
  }
}
