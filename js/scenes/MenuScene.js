class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    let gm = this.registry.get('gameManager');
    if (!gm) { gm = new GameManager(); this.registry.set('gameManager', gm); }
    gm.init();
    this.gm = gm;

    // Estrellas
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      const s = this.add.sprite(Phaser.Math.Between(0, CONFIG.WIDTH), Phaser.Math.Between(0, CONFIG.HEIGHT), 'star');
      s.setAlpha(0.1 + Math.random() * 0.9);
      s.speedY = 10 + Math.random() * 80;
      this.stars.push(s);
    }

    // Titulo
    this.add.text(CONFIG.WIDTH / 2, 55, 'SPACE', {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '30px', color: '#00bfff'
    }).setOrigin(0.5).setDepth(5);

    this.add.text(CONFIG.WIDTH / 2, 95, 'ASSAULT', {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '30px', color: '#ff4444'
    }).setOrigin(0.5).setDepth(5);

    // Linea decorativa
    this.add.rectangle(CONFIG.WIDTH / 2, 120, 200, 1, 0x224466).setDepth(5);

    // Nave
    this.add.circle(CONFIG.WIDTH / 2, 220, 40, 0x0055cc, 0.08);
    const ship = this.add.sprite(CONFIG.WIDTH / 2, 220, 'menu-ship').setScale(0.65).setDepth(3);
    this.tweens.add({ targets: ship, y: 228, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Menu
    this.selectedOption = 0;
    this.menuOptions = [];
    this.showingControls = false;
    this.controlsGroup = [];

    const cx = CONFIG.WIDTH / 2;
    const options = [
      { text: 'JUGAR',      icon: '>', action: () => this._startGame() },
      { text: 'RANKING',    icon: '#', action: () => this._goScene('RankingScene') },
      { text: 'CONTROLES',  icon: '?', action: () => this._toggleControls() }
    ];

    options.forEach((opt, i) => {
      const y = 340 + i * 48;
      const bg = this.add.rectangle(cx, y, 240, 40, 0x0a0a18, 0.7).setStrokeStyle(1, 0x222244).setDepth(4);
      const icon = this.add.text(cx - 100, y, opt.icon, {
        fontFamily: CONFIG.FONT_UI, fontSize: '18px', color: '#334466'
      }).setOrigin(0.5).setDepth(4);
      const txt = this.add.text(cx + 10, y, opt.text, {
        fontFamily: CONFIG.FONT_UI, fontSize: '17px', color: '#667788'
      }).setOrigin(0.5).setDepth(4);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => { this.selectedOption = i; this._highlight(); });
      bg.on('pointerdown', () => { this.selectedOption = i; this._select(); });

      this.menuOptions.push({ bg, txt, icon, action: opt.action });
    });

    this._highlight();

    // High Score
    const hs = gm.getHighScore();
    if (hs > 0) {
      this.add.rectangle(cx, 530, 220, 32, 0x1a1500, 0.5).setStrokeStyle(1, 0x443300);
      this.add.text(cx, 530, 'BEST: ' + hs, {
        fontFamily: CONFIG.FONT_UI, fontSize: '15px', color: '#ffaa00'
      }).setOrigin(0.5);
    }

    // Version
    this.add.text(cx, CONFIG.HEIGHT - 12, 'v1.0', {
      fontFamily: CONFIG.FONT_UI, fontSize: '9px', color: '#222'
    }).setOrigin(0.5);

    // Input
    this.input.keyboard.on('keydown-UP', () => this._move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this._move(1));
    this.input.keyboard.on('keydown-W', () => this._move(-1));
    this.input.keyboard.on('keydown-S', () => this._move(1));
    this.input.keyboard.on('keydown-ENTER', () => this._select());
    this.input.keyboard.on('keydown-SPACE', () => this._select());
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.showingControls) this._toggleControls();
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _highlight() {
    this.menuOptions.forEach((o, i) => {
      if (i === this.selectedOption) {
        o.bg.setStrokeStyle(2, 0x00ddff).setFillStyle(0x0a1a2a, 0.9);
        o.txt.setColor('#00ddff');
        o.icon.setColor('#00ddff');
      } else {
        o.bg.setStrokeStyle(1, 0x222244).setFillStyle(0x0a0a18, 0.7);
        o.txt.setColor('#667788');
        o.icon.setColor('#334466');
      }
    });
  }

  _move(dir) {
    this.gm.audio.resume();
    this.gm.audio.play('select');
    if (this.showingControls) return;
    this.selectedOption = (this.selectedOption + dir + this.menuOptions.length) % this.menuOptions.length;
    this._highlight();
  }

  _select() {
    this.gm.audio.resume();
    this.gm.audio.play('select');
    if (this.showingControls) { this._toggleControls(); return; }
    const o = this.menuOptions[this.selectedOption];
    if (o) o.action();
  }

  _startGame() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }

  _goScene(key) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key));
  }

  _toggleControls() {
    if (this.showingControls) {
      this.controlsGroup.forEach(el => el.destroy());
      this.controlsGroup = [];
      this.showingControls = false;
      return;
    }
    this.showingControls = true;
    this.controlsGroup = buildControlsPanel(this, () => this._toggleControls());
  }

  update(time, delta) {
    this.stars.forEach(s => {
      s.y += s.speedY * (delta / 1000);
      if (s.y > CONFIG.HEIGHT + 5) { s.y = -5; s.x = Phaser.Math.Between(0, CONFIG.WIDTH); }
    });
  }
}
