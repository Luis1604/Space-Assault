class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.gameManager = this.registry.get('gameManager');

    // Score - arriba izquierda
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontFamily: CONFIG.FONT_UI,
      fontSize: '16px',
      color: '#ffffff'
    }).setDepth(100);

    // Combo - debajo del score
    this.comboText = this.add.text(16, 38, '', {
      fontFamily: CONFIG.FONT_UI,
      fontSize: '14px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setDepth(100).setAlpha(0);

    // Wave - arriba centro
    this.waveText = this.add.text(CONFIG.WIDTH / 2, 16, 'WAVE: 1', {
      fontFamily: CONFIG.FONT_UI,
      fontSize: '16px',
      color: '#00ffaa'
    }).setOrigin(0.5, 0).setDepth(100);

    // Vidas - arriba derecha
    this.livesIcons = [];
    this.updateLivesDisplay(CONFIG.PLAYER_LIVES);

    // Texto grande de wave
    this.waveBigText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 50, '', {
      fontFamily: CONFIG.FONT_TITLE,
      fontSize: '22px',
      color: '#00ffaa',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    // Warning text para boss
    this.warningText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 50, 'WARNING', {
      fontFamily: CONFIG.FONT_TITLE,
      fontSize: '26px',
      color: '#ff0000'
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.warningSubText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 'BOSS INCOMING', {
      fontFamily: CONFIG.FONT_UI,
      fontSize: '18px',
      color: '#ff4444'
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    // Power-up timer bar (abajo centro)
    this.powerUpBarBg = this.add.rectangle(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 20, 120, 8, 0x333333)
      .setDepth(100).setVisible(false);
    this.powerUpBarFill = this.add.rectangle(CONFIG.WIDTH / 2 - 60, CONFIG.HEIGHT - 20, 120, 8, 0xff8800)
      .setOrigin(0, 0.5).setDepth(100).setVisible(false);
    this.powerUpLabel = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 34, '', {
      fontFamily: CONFIG.FONT_UI,
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    // Touch hint (solo en movil)
    this.touchHint = null;
    if ('ontouchstart' in window) {
      this.touchHint = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 50, 'IZQ: mover  |  DER: disparar', {
        fontFamily: CONFIG.FONT_UI,
        fontSize: '10px',
        color: '#555555'
      }).setOrigin(0.5).setDepth(100);

      // Desaparece despues de 5s
      this.time.delayedCall(5000, () => {
        if (this.touchHint) {
          this.tweens.add({
            targets: this.touchHint,
            alpha: 0,
            duration: 1000,
            onComplete: () => { this.touchHint.destroy(); this.touchHint = null; }
          });
        }
      });
    }

    // Escuchar eventos de GameScene
    const gameScene = this.scene.get('GameScene');
    if (!gameScene) return;

    gameScene.events.on('score-changed', (score) => {
      this.scoreText.setText('SCORE: ' + score);
    });

    gameScene.events.on('lives-changed', (lives) => {
      this.updateLivesDisplay(lives);
    });

    gameScene.events.on('wave-started', (wave) => {
      this.waveText.setText('WAVE: ' + wave);
      this.showWaveBanner(wave);
    });

    gameScene.events.on('boss-warning', () => {
      this.showBossWarning();
    });

    gameScene.events.on('powerup-timer', (type, timeLeft, duration) => {
      this.updatePowerUpBar(type, timeLeft, duration);
    });

    gameScene.events.on('combo-changed', (multiplier, combo) => {
      this.updateComboDisplay(multiplier, combo);
    });
  }

  updateLivesDisplay(lives) {
    this.livesIcons.forEach(icon => icon.destroy());
    this.livesIcons = [];
    if (this.livesText) { this.livesText.destroy(); this.livesText = null; }

    if (lives <= 5) {
      for (let i = 0; i < lives; i++) {
        const icon = this.add.sprite(
          CONFIG.WIDTH - 24 - (i * 22),
          24,
          'life-icon'
        ).setDepth(100);
        this.livesIcons.push(icon);
      }
    } else {
      const icon = this.add.sprite(CONFIG.WIDTH - 16, 24, 'life-icon').setDepth(100);
      this.livesIcons.push(icon);
      this.livesText = this.add.text(CONFIG.WIDTH - 30, 16, 'x' + lives, {
        fontFamily: CONFIG.FONT_UI,
        fontSize: '16px',
        color: '#ff4444',
        fontStyle: 'bold'
      }).setOrigin(1, 0).setDepth(100);
    }
  }

  updateComboDisplay(multiplier, combo) {
    if (multiplier > 1) {
      const comboColors = { 2: '#ffaa00', 3: '#ff6600', 4: '#ff00ff' };
      this.comboText.setText('x' + multiplier + ' COMBO');
      this.comboText.setColor(comboColors[multiplier] || '#ffaa00');
      this.comboText.setAlpha(1);

      // Pulso al subir de combo
      if (!this._lastCombo || this._lastCombo < multiplier) {
        this.tweens.killTweensOf(this.comboText);
        this.comboText.setScale(1.4);
        this.tweens.add({
          targets: this.comboText,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }
      this._lastCombo = multiplier;
    } else {
      if (this.comboText.alpha > 0) {
        this.tweens.add({
          targets: this.comboText,
          alpha: 0,
          duration: 300
        });
      }
      this._lastCombo = 1;
    }
  }

  showWaveBanner(wave) {
    this.waveBigText.setText('WAVE ' + wave);
    this.waveBigText.setAlpha(1);
    this.waveBigText.setScale(0.5);

    this.tweens.add({
      targets: this.waveBigText,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: this.waveBigText,
            alpha: 0,
            duration: 500
          });
        });
      }
    });
  }

  showBossWarning() {
    const flash = this.add.rectangle(
      CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2,
      CONFIG.WIDTH, CONFIG.HEIGHT,
      0xff0000, 0.15
    ).setDepth(99);

    this.warningText.setAlpha(1);
    this.warningSubText.setAlpha(1);

    this.tweens.add({
      targets: [this.warningText, flash],
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.warningText.setAlpha(0);
        this.warningSubText.setAlpha(0);
        flash.destroy();
      }
    });

    this.tweens.add({
      targets: this.warningSubText,
      alpha: 0,
      duration: 500,
      delay: 1800
    });
  }

  updatePowerUpBar(type, timeLeft, duration) {
    if (!type || timeLeft <= 0) {
      this.powerUpBarBg.setVisible(false);
      this.powerUpBarFill.setVisible(false);
      this.powerUpLabel.setVisible(false);
      return;
    }

    this.powerUpBarBg.setVisible(true);
    this.powerUpBarFill.setVisible(true);
    this.powerUpLabel.setVisible(true);

    const ratio = Math.max(0, timeLeft / duration);
    this.powerUpBarFill.setSize(120 * ratio, 8);

    const info = PowerUp.TYPES[type];
    if (info) {
      this.powerUpLabel.setText(info.label.replace('!', ''));
      const colorMap = {
        'DOUBLE_SHOT': 0xff8800,
        'TRIPLE_SHOT': 0x00ffff,
        'RAPID_FIRE': 0xffff00
      };
      this.powerUpBarFill.setFillStyle(colorMap[type] || 0xffffff);
    }
  }
}
