class RankingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RankingScene' });
  }

  create() {
    this.gameManager = this.registry.get('gameManager');
    const cx = CONFIG.WIDTH / 2;

    // Estrellas
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      const s = this.add.sprite(Phaser.Math.Between(0, CONFIG.WIDTH), Phaser.Math.Between(0, CONFIG.HEIGHT), 'star');
      s.setAlpha(0.1 + Math.random() * 0.6);
      s.speedY = 10 + Math.random() * 40;
      this.stars.push(s);
    }

    // Panel
    this.add.rectangle(cx, CONFIG.HEIGHT / 2, CONFIG.WIDTH - 20, CONFIG.HEIGHT - 30, 0x060610, 0.9)
      .setStrokeStyle(1, 0x1a1a3a);

    // Titulo
    this.add.text(cx, 35, 'RANKING', {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '18px', color: '#ffaa00'
    }).setOrigin(0.5);
    this.add.text(cx, 55, 'TOP 10', {
      fontFamily: CONFIG.FONT_UI, fontSize: '11px', color: '#555'
    }).setOrigin(0.5);
    this.add.rectangle(cx, 68, 320, 1, 0x332200);

    // Loading
    this.loadingText = this.add.text(cx, 350, 'Cargando...', {
      fontFamily: CONFIG.FONT_UI, fontSize: '14px', color: '#0af'
    }).setOrigin(0.5);

    this._loadRanking();

    // Boton volver
    this.add.rectangle(cx, CONFIG.HEIGHT - 55, 320, 1, 0x1a1a3a);
    const backBtn = this.add.rectangle(cx, CONFIG.HEIGHT - 30, 180, 28, 0x0a0a18, 0.8)
      .setStrokeStyle(1, 0x00aaff).setInteractive({ useHandCursor: true });
    this.add.text(cx, CONFIG.HEIGHT - 30, 'VOLVER', {
      fontFamily: CONFIG.FONT_UI, fontSize: '13px', color: '#00ddff'
    }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this._goBack());
    backBtn.on('pointerover', () => backBtn.setStrokeStyle(2, 0x00ffaa));
    backBtn.on('pointerout', () => backBtn.setStrokeStyle(1, 0x00aaff));

    this.input.keyboard.on('keydown-ESC', () => this._goBack());
    this.input.keyboard.on('keydown-ENTER', () => this._goBack());

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _goBack() {
    if (this.gameManager) this.gameManager.audio.play('select');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }

  _loadRanking() {
    const cx = CONFIG.WIDTH / 2;

    fetch('/api/ranking?limit=10')
      .then(r => r.json())
      .then(data => {
        if (this.loadingText) this.loadingText.destroy();

        if (!data.ranking || data.ranking.length === 0) {
          this.add.text(cx, 350, 'No hay scores', {
            fontFamily: CONFIG.FONT_UI, fontSize: '14px', color: '#334455'
          }).setOrigin(0.5);
          return;
        }

        const startY = 90;
        const rowH = 55;

        data.ranking.forEach((entry, i) => {
          const y = startY + i * rowH;
          const isTop3 = i < 3;
          const medalColors = ['#ffdd00', '#bbbbbb', '#cc8844'];
          const medalBg = [0x1a1a05, 0x0f0f18, 0x15100a];

          // Fondo de fila
          const bgColor = isTop3 ? medalBg[i] : (i % 2 === 0 ? 0x0a0a15 : 0x080810);
          this.add.rectangle(cx, y, CONFIG.WIDTH - 40, rowH - 4, bgColor, isTop3 ? 0.6 : 0.3);

          // Borde medal
          if (isTop3) {
            const mc = [0xffdd00, 0xaaaaaa, 0xcc8844];
            this.add.rectangle(15, y, 3, rowH - 8, mc[i]);
          }

          // === IZQUIERDA: Posicion + Nombre ===
          // Posicion
          const posLabel = isTop3 ? ['1st', '2nd', '3rd'][i] : '' + (i + 1);
          this.add.text(30, y - 10, posLabel, {
            fontFamily: CONFIG.FONT_TITLE,
            fontSize: isTop3 ? '10px' : '8px',
            color: isTop3 ? medalColors[i] : '#445566'
          });

          // Nombre
          const nameSize = isTop3 ? '15px' : '13px';
          this.add.text(75, y - 10, entry.name, {
            fontFamily: CONFIG.FONT_UI, fontSize: nameSize,
            color: isTop3 ? '#ffffff' : '#8899aa'
          });

          // === ABAJO: Stats en una linea ===
          const statsY = y + 10;
          const statsColor = isTop3 ? '#668877' : '#445566';

          this.add.text(75, statsY, 'W' + entry.wave, {
            fontFamily: CONFIG.FONT_UI, fontSize: '10px', color: '#0088bb'
          });

          this.add.text(120, statsY, entry.kills + ' kills', {
            fontFamily: CONFIG.FONT_UI, fontSize: '10px', color: '#aa7700'
          });

          this.add.text(195, statsY, entry.date || '', {
            fontFamily: CONFIG.FONT_UI, fontSize: '10px', color: '#334455'
          });

          // === DERECHA: Score ===
          this.add.text(CONFIG.WIDTH - 25, y, entry.score.toLocaleString(), {
            fontFamily: CONFIG.FONT_UI,
            fontSize: isTop3 ? '18px' : '14px',
            color: isTop3 ? '#00ff88' : '#44aa66'
          }).setOrigin(1, 0.5);
        });
      })
      .catch(() => {
        if (this.loadingText) {
          this.loadingText.setText('Error de conexion');
          this.loadingText.setColor('#ff4444');
        }
      });
  }

  update(time, delta) {
    this.stars.forEach(s => {
      s.y += s.speedY * (delta / 1000);
      if (s.y > CONFIG.HEIGHT + 5) { s.y = -5; s.x = Phaser.Math.Between(0, CONFIG.WIDTH); }
    });
  }
}
