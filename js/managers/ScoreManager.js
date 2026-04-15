class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;
    this.newHighScore = false;

    // Combo system
    this.combo = 0;
    this.comboMultiplier = 1;
    this.lastKillTime = 0;
    this.comboTimeout = 2000; // 2s sin matar = reset
    this.comboThreshold = 1000; // <1s entre kills = combo sube
  }

  reset() {
    this.score = 0;
    this.newHighScore = false;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.lastKillTime = 0;
  }

  addScore(points) {
    const now = Date.now();
    const timeSinceLastKill = now - this.lastKillTime;

    // Combo logic
    if (this.lastKillTime > 0 && timeSinceLastKill < this.comboThreshold) {
      this.combo++;
      this.comboMultiplier = Math.min(4, 1 + Math.floor(this.combo / 2));
    } else if (timeSinceLastKill > this.comboTimeout) {
      this.combo = 0;
      this.comboMultiplier = 1;
    }

    this.lastKillTime = now;

    const finalPoints = points * this.comboMultiplier;
    this.score += finalPoints;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.newHighScore = true;
      this.saveHighScore();
    }

    return finalPoints;
  }

  updateCombo(delta) {
    // Decaimiento del combo por tiempo
    if (this.combo > 0 && Date.now() - this.lastKillTime > this.comboTimeout) {
      this.combo = 0;
      this.comboMultiplier = 1;
    }
  }

  saveHighScore() {
    localStorage.setItem(CONFIG.STORAGE_KEY, this.highScore.toString());
  }

  getScore() {
    return this.score;
  }

  getHighScore() {
    return this.highScore;
  }

  getComboMultiplier() {
    return this.comboMultiplier;
  }

  getCombo() {
    return this.combo;
  }
}
