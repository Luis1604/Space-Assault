class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    this.gameManager = this.registry.get('gameManager');
    this.inputActive = false;
    this.playerName = '';
    this.scoreSaved = false;
    this.cursorBlink = true;
    const cx = CONFIG.WIDTH / 2;

    // Estrellas
    this.stars = [];
    for (let i = 0; i < 30; i++) {
      const s = this.add.sprite(Phaser.Math.Between(0, CONFIG.WIDTH), Phaser.Math.Between(0, CONFIG.HEIGHT), 'star');
      s.setAlpha(0.3); s.speedY = 10 + Math.random() * 20;
      this.stars.push(s);
    }

    // Panel central
    this.add.rectangle(cx, CONFIG.HEIGHT / 2, 340, 560, 0x060610, 0.9)
      .setStrokeStyle(1, 0x1a1a3a);

    // GAME OVER
    const goText = this.add.text(cx, 100, 'GAME OVER', {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '24px', color: '#ff3333'
    }).setOrigin(0.5);
    this.tweens.add({ targets: goText, alpha: 0.4, duration: 1200, yoyo: true, repeat: -1 });

    this.add.rectangle(cx, 125, 260, 1, 0x441111);

    // Score
    this.add.text(cx, 155, 'SCORE', {
      fontFamily: CONFIG.FONT_UI, fontSize: '12px', color: '#667788'
    }).setOrigin(0.5);

    this.add.text(cx, 185, this.gameManager.getScore().toLocaleString(), {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '22px', color: '#ffffff'
    }).setOrigin(0.5);

    // Stats en una fila
    const kills = this.registry.get('lastKills') || 0;
    const wave = this.gameManager.getCurrentWave();

    this.add.rectangle(cx, 230, 260, 1, 0x1a1a3a);

    // Wave box
    this.add.rectangle(cx - 65, 265, 110, 45, 0x0a1a1a, 0.6).setStrokeStyle(1, 0x003344);
    this.add.text(cx - 65, 252, 'WAVE', {
      fontFamily: CONFIG.FONT_UI, fontSize: '9px', color: '#00aacc'
    }).setOrigin(0.5);
    this.add.text(cx - 65, 273, '' + wave, {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '16px', color: '#00ffaa'
    }).setOrigin(0.5);

    // Kills box
    this.add.rectangle(cx + 65, 265, 110, 45, 0x1a1505, 0.6).setStrokeStyle(1, 0x443300);
    this.add.text(cx + 65, 252, 'KILLS', {
      fontFamily: CONFIG.FONT_UI, fontSize: '9px', color: '#cc8800'
    }).setOrigin(0.5);
    this.add.text(cx + 65, 273, '' + kills, {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '16px', color: '#ffaa00'
    }).setOrigin(0.5);

    this.add.rectangle(cx, 300, 260, 1, 0x1a1a3a);

    // High Score
    this.add.text(cx, 325, 'BEST: ' + this.gameManager.getHighScore().toLocaleString(), {
      fontFamily: CONFIG.FONT_UI, fontSize: '14px', color: '#888'
    }).setOrigin(0.5);

    const isNewHigh = this.gameManager.isNewHighScore();

    if (isNewHigh) {
      // NEW RECORD
      const newText = this.add.text(cx, 355, 'NEW RECORD!', {
        fontFamily: CONFIG.FONT_TITLE, fontSize: '12px', color: '#ffff00'
      }).setOrigin(0.5);
      this.tweens.add({ targets: newText, scaleX: 1.15, scaleY: 1.15, duration: 600, yoyo: true, repeat: -1 });

      // Input nombre
      this.add.text(cx, 390, 'Tu nombre:', {
        fontFamily: CONFIG.FONT_UI, fontSize: '12px', color: '#667788'
      }).setOrigin(0.5);

      this.nameBox = this.add.rectangle(cx, 420, 200, 34, 0x0a0a1a)
        .setStrokeStyle(2, 0x00aaff);

      this.nameDisplay = this.add.text(cx, 420, '_', {
        fontFamily: CONFIG.FONT_UI, fontSize: '20px', color: '#00ddff'
      }).setOrigin(0.5);

      this.time.addEvent({
        delay: 400, loop: true,
        callback: () => { this.cursorBlink = !this.cursorBlink; this._updateName(); }
      });

      this.inputActive = true;

      this.input.keyboard.on('keydown', (e) => {
        if (!this.inputActive) return;
        if (e.key === 'Enter' && this.playerName.length > 0) this._submit();
        else if (e.key === 'Backspace') { this.playerName = this.playerName.slice(0, -1); this._updateName(); }
        else if (e.key.length === 1 && this.playerName.length < 12 && /[a-zA-Z0-9_\- ]/.test(e.key)) {
          this.playerName += e.key; this._updateName();
        }
      });

      this.submitHint = this.add.text(cx, 448, 'ENTER para guardar', {
        fontFamily: CONFIG.FONT_UI, fontSize: '10px', color: '#445566'
      }).setOrigin(0.5);

    } else {
      this._saveToServer('---', this.gameManager.getScore(), wave, kills);
      this._showActions(380);
    }

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  _updateName() {
    if (!this.nameDisplay) return;
    this.nameDisplay.setText(this.playerName + (this.cursorBlink ? '_' : ''));
  }

  _submit() {
    if (this.scoreSaved) return;
    this.scoreSaved = true;
    this.inputActive = false;

    const name = this.playerName || 'AAA';
    if (this.nameBox) this.nameBox.setStrokeStyle(2, 0x00ff88);
    if (this.nameDisplay) { this.nameDisplay.setColor('#00ff88'); this.nameDisplay.setText(name); }
    if (this.submitHint) this.submitHint.setText('Guardado!');

    this._saveToServer(name, this.gameManager.getScore(), this.gameManager.getCurrentWave(), this.registry.get('lastKills') || 0);

    this.time.delayedCall(400, () => this._showActions(490));
  }

  _saveToServer(name, score, wave, kills) {
    fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, wave, kills })
    }).then(r => r.json()).then(data => {
      if (data.position) {
        const posY = this.gameManager.isNewHighScore() ? 465 : 355;
        this.add.text(CONFIG.WIDTH / 2, posY, '#' + data.position + ' en ranking', {
          fontFamily: CONFIG.FONT_UI, fontSize: '11px', color: '#0099dd'
        }).setOrigin(0.5);
      }
    }).catch(() => {});
  }

  _showActions(y) {
    const cx = CONFIG.WIDTH / 2;
    this._actionSelected = 0;
    this._actionOptions = [];
    this._actionsReady = true;

    this.add.rectangle(cx, y + 10, 260, 1, 0x1a1a3a);

    const actions = [
      { text: 'REINICIAR', scene: 'GameScene' },
      { text: 'MENU',      scene: 'MenuScene' },
      { text: 'RANKING',   scene: 'RankingScene' }
    ];

    actions.forEach((a, i) => {
      const ay = y + 38 + i * 42;

      const bg = this.add.rectangle(cx, ay, 230, 34, 0x0a0a18, 0.7)
        .setStrokeStyle(1, 0x222244)
        .setInteractive({ useHandCursor: true });

      const txt = this.add.text(cx, ay, a.text, {
        fontFamily: CONFIG.FONT_UI, fontSize: '15px', color: '#667788'
      }).setOrigin(0.5);

      bg.on('pointerover', () => {
        this._actionSelected = i;
        this._highlightActions();
      });
      bg.on('pointerdown', () => {
        this._actionSelected = i;
        this._go(a.scene);
      });

      this._actionOptions.push({ bg, txt, scene: a.scene });
    });

    this._highlightActions();

    // Input teclado
    this.input.keyboard.on('keydown', (e) => {
      if (this.inputActive || !this._actionsReady) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this._actionSelected = (this._actionSelected - 1 + this._actionOptions.length) % this._actionOptions.length;
        this._highlightActions();
        this.gameManager.audio.play('select');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this._actionSelected = (this._actionSelected + 1) % this._actionOptions.length;
        this._highlightActions();
        this.gameManager.audio.play('select');
      } else if (e.key === 'Enter' || e.key === ' ') {
        this.gameManager.audio.play('select');
        this._go(this._actionOptions[this._actionSelected].scene);
      }
    });
  }

  _highlightActions() {
    if (!this._actionOptions) return;
    this._actionOptions.forEach((o, i) => {
      if (i === this._actionSelected) {
        o.bg.setStrokeStyle(2, 0x00ddff).setFillStyle(0x0a1a2a, 0.9);
        o.txt.setColor('#00ddff');
      } else {
        o.bg.setStrokeStyle(1, 0x222244).setFillStyle(0x0a0a18, 0.7);
        o.txt.setColor('#667788');
      }
    });
  }

  _go(scene) {
    this.gameManager.audio.play('select');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene));
  }

  update(time, delta) {
    this.stars.forEach(s => {
      s.y += s.speedY * (delta / 1000);
      if (s.y > CONFIG.HEIGHT + 5) { s.y = -5; s.x = Phaser.Math.Between(0, CONFIG.WIDTH); }
    });
  }
}
