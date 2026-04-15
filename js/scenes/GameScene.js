class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    this.gameManager = this.registry.get('gameManager');
    if (!this.gameManager) {
      this.gameManager = new GameManager();
      this.registry.set('gameManager', this.gameManager);
    }
    this.gameManager.init();
    this.gameManager.startGame();
  }

  create() {
    this.isPaused = false;

    // Fondo parallax - estrellas
    this.starLayers = [];
    CONFIG.STAR_LAYERS.forEach((layer) => {
      const stars = [];
      for (let i = 0; i < layer.count; i++) {
        const star = this.add.sprite(
          Phaser.Math.Between(0, CONFIG.WIDTH),
          Phaser.Math.Between(0, CONFIG.HEIGHT),
          'star'
        );
        star.setAlpha(layer.alpha);
        star.setDepth(0);
        star.speedY = layer.speed;
        stars.push(star);
      }
      this.starLayers.push(stars);
    });

    // Pool de balas del jugador
    this.bullets = new BulletPool(this);

    // Pool de balas enemigas
    this.enemyBullets = new EnemyBulletPool(this);

    // Pool de enemigos
    this.enemies = new EnemyPool(this);

    // Pool de power-ups
    this.powerups = new PowerUpPool(this);

    // Boss
    this.boss = new Boss(this, 0, 0);
    this.bossActive = false;

    // Jugador
    this.player = new Player(this, CONFIG.WIDTH / 2, CONFIG.HEIGHT - 70);

    // Trail del jugador
    this.trailTimer = this.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        if (this.player.isDead || !this.gameManager.isPlaying() || this.isPaused) return;
        const trail = this.add.sprite(this.player.x, this.player.y + 14, 'particle');
        trail.setDepth(5);
        trail.setTint(0x0066ff);
        trail.setScale(0.8);
        trail.setAlpha(0.6);
        this.tweens.add({
          targets: trail,
          y: trail.y + 20,
          alpha: 0,
          scaleX: 0.1,
          scaleY: 0.1,
          duration: 200,
          onComplete: () => trail.destroy()
        });
      }
    });

    // --- Colisiones ---
    this.physics.add.overlap(
      this.bullets, this.enemies,
      this.onBulletHitEnemy, null, this
    );

    this.physics.add.overlap(
      this.bullets, this.boss,
      this.onBulletHitBoss, null, this
    );

    this.physics.add.overlap(
      this.enemyBullets, this.player,
      this.onEnemyBulletHitPlayer, null, this
    );

    // Balas del jugador destruyen balas enemigas
    this.physics.add.overlap(
      this.bullets, this.enemyBullets,
      this.onBulletHitEnemyBullet, null, this
    );

    this.physics.add.overlap(
      this.enemies, this.player,
      this.onEnemyHitPlayer, null, this
    );

    this.physics.add.overlap(
      this.powerups, this.player,
      this.onPlayerCollectPowerUp, null, this
    );

    this.physics.add.overlap(
      this.boss, this.player,
      this.onBossHitPlayer, null, this
    );

    // Contador de kills
    this.killCount = 0;

    // Lanzar UI Scene en paralelo
    this.scene.launch('UIScene');

    // Eventos
    this.events.on('player-dead', this.onPlayerDead, this);
    this.events.on('boss-dead', this.onBossDead, this);

    // Pausa con ESC
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyEsc.on('down', () => {
      if (this.gameManager.getCurrentState() === CONFIG.STATES.GAMEOVER) return;
      // Si el panel de controles esta abierto, cerrarlo primero
      if (this._pauseControlsShowing) {
        this._pauseShowControls();
        return;
      }
      this.togglePause();
    });

    // Pausa - elementos (ocultos)
    this._pauseEls = [];
    this._pauseOptions = [];
    this._pauseSelected = 0;
    this._buildPauseMenu();

    // Input de pausa (arriba/abajo/enter solo cuando pausado)
    this.input.keyboard.on('keydown-UP', () => { if (this.isPaused) this._pauseMove(-1); });
    this.input.keyboard.on('keydown-DOWN', () => { if (this.isPaused) this._pauseMove(1); });
    this.input.keyboard.on('keydown-W', () => { if (this.isPaused) this._pauseMove(-1); });
    this.input.keyboard.on('keydown-S', () => { if (this.isPaused) this._pauseMove(1); });
    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.isPaused) {
        if (this._pauseControlsShowing) { this._pauseShowControls(); return; }
        this._pauseSelect();
      }
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.isPaused) {
        if (this._pauseControlsShowing) { this._pauseShowControls(); return; }
        this._pauseSelect();
      }
    });

    // Control de waves
    this.waveTransition = false;

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 17);

    // Iniciar primera wave con delay + musica
    this.time.delayedCall(1000, () => {
      this.startNextWave();
      this.gameManager.audio.startMusic();
    });

    // Resumir audio en primera interaccion
    this.input.keyboard.on('keydown', () => {
      this.gameManager.audio.resume();
    }, this);

    // Touch controls
    this.setupTouchControls();
  }

  _buildPauseMenu() {
    const cx = CONFIG.WIDTH / 2;
    const cy = CONFIG.HEIGHT / 2;
    this._pauseControlsShowing = false;
    this._pauseControlsEls = [];

    // Layout: panel de 440px alto
    const panelTop = cy - 220;

    // Overlay
    const overlay = this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x000011, 0.85).setDepth(50).setVisible(false);
    this._pauseEls.push(overlay);

    // Panel
    const panel = this.add.rectangle(cx, cy, 280, 440, 0x080818, 0.95).setStrokeStyle(2, 0x00aaff).setDepth(51).setVisible(false);
    this._pauseEls.push(panel);

    // Linea top
    this._pauseEls.push(this.add.rectangle(cx, panelTop + 10, 240, 2, 0x00aaff).setDepth(51).setVisible(false));

    // Titulo
    this._pauseEls.push(this.add.text(cx, panelTop + 35, 'PAUSA', {
      fontFamily: CONFIG.FONT_TITLE, fontSize: '18px', color: '#00ddff'
    }).setOrigin(0.5).setDepth(52).setVisible(false));

    // Linea bajo titulo
    this._pauseEls.push(this.add.rectangle(cx, panelTop + 58, 240, 1, 0x1a2a3a).setDepth(51).setVisible(false));

    // Score info
    this._pauseScoreText = this.add.text(cx, panelTop + 78, '', {
      fontFamily: CONFIG.FONT_UI, fontSize: '11px', color: '#556677'
    }).setOrigin(0.5).setDepth(52).setVisible(false);
    this._pauseEls.push(this._pauseScoreText);

    // Opciones navegables
    const options = [
      { text: 'CONTINUAR',  action: () => this.togglePause() },
      { text: 'CONTROLES',  action: () => this._pauseShowControls() },
      { text: 'MUSICA: ON', action: () => this._toggleMusic() },
      { text: 'REINICIAR',  action: () => this._pauseRestart() },
      { text: 'SALIR',      action: () => this._pauseQuit() }
    ];

    const firstOptY = panelTop + 115;

    options.forEach((opt, i) => {
      const y = firstOptY + i * 42;

      const bg = this.add.rectangle(cx, y, 230, 36, 0x0a0a18, 0.7)
        .setStrokeStyle(1, 0x222244).setDepth(52).setVisible(false)
        .setInteractive({ useHandCursor: true });

      const txt = this.add.text(cx, y, opt.text, {
        fontFamily: CONFIG.FONT_UI, fontSize: '15px', color: '#667788'
      }).setOrigin(0.5).setDepth(52).setVisible(false);

      bg.on('pointerover', () => { this._pauseSelected = i; this._highlightPause(); });
      bg.on('pointerdown', () => { this._pauseSelected = i; this._pauseSelect(); });

      this._pauseEls.push(bg);
      this._pauseEls.push(txt);
      this._pauseOptions.push({ bg, txt, action: opt.action });
    });

    // Linea bottom
    const panelBottom = cy + 220;
    this._pauseEls.push(this.add.rectangle(cx, panelBottom - 30, 240, 2, 0x00aaff).setDepth(51).setVisible(false));

    // Hint
    this._pauseEls.push(this.add.text(cx, panelBottom - 15, 'ESC para continuar', {
      fontFamily: CONFIG.FONT_UI, fontSize: '10px', color: '#334455'
    }).setOrigin(0.5).setDepth(52).setVisible(false));
  }

  _highlightPause() {
    this._pauseOptions.forEach((o, i) => {
      if (i === this._pauseSelected) {
        o.bg.setStrokeStyle(2, 0x00ddff).setFillStyle(0x0a1a2a, 0.9);
        o.txt.setColor('#00ddff');
      } else {
        o.bg.setStrokeStyle(1, 0x222244).setFillStyle(0x0a0a18, 0.7);
        o.txt.setColor('#667788');
      }
    });
  }

  _pauseMove(dir) {
    this.gameManager.audio.play('select');
    this._pauseSelected = (this._pauseSelected + dir + this._pauseOptions.length) % this._pauseOptions.length;
    this._highlightPause();
  }

  _pauseSelect() {
    this.gameManager.audio.play('select');
    const opt = this._pauseOptions[this._pauseSelected];
    if (opt) opt.action();
  }

  _toggleMusic() {
    this.gameManager.audio.enabled = !this.gameManager.audio.enabled;
    const musicOpt = this._pauseOptions[2];
    if (musicOpt) musicOpt.txt.setText('MUSICA: ' + (this.gameManager.audio.enabled ? 'ON' : 'OFF'));
  }

  _pauseRestart() {
    this.isPaused = false;
    this.physics.resume();
    this._pauseEls.forEach(el => { if (el) el.setVisible(false); });
    this.gameManager.state = CONFIG.STATES.PLAYING;
    this.gameManager.audio.stopMusic();
    this.scene.stop('UIScene');
    this.scene.restart();
  }

  _pauseShowControls() {
    if (this._pauseControlsShowing) {
      this._pauseControlsEls.forEach(el => el.destroy());
      this._pauseControlsEls = [];
      this._pauseControlsShowing = false;
      return;
    }
    this._pauseControlsShowing = true;
    this._pauseControlsEls = buildControlsPanel(this, () => this._pauseShowControls(), 70);
  }

  _pauseQuit() {
    this.isPaused = false;
    this.physics.resume();
    this._pauseEls.forEach(el => { if (el) el.setVisible(false); });
    this.gameManager.audio.stopMusic();
    this.scene.stop('UIScene');
    this.scene.start('MenuScene');
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.gameManager.audio.stopMusic();
      this._pauseSelected = 0;

      this._pauseEls.forEach(el => { if (el) el.setVisible(true); });
      this._highlightPause();

      // Actualizar textos dinamicos
      if (this._pauseScoreText) {
        this._pauseScoreText.setText('Score: ' + this.gameManager.getScore() + '  |  Wave: ' + this.gameManager.waves.currentWave);
      }
      const musicOpt = this._pauseOptions[2];
      if (musicOpt) musicOpt.txt.setText('MUSICA: ' + (this.gameManager.audio.enabled ? 'ON' : 'OFF'));

      this.gameManager.state = CONFIG.STATES.PAUSED;
    } else {
      this.physics.resume();
      this.gameManager.audio.startMusic();
      this._pauseEls.forEach(el => { if (el) el.setVisible(false); });
      // Cerrar panel de controles si estaba abierto
      if (this._pauseControlsShowing) {
        this._pauseControlsEls.forEach(el => el.destroy());
        this._pauseControlsEls = [];
        this._pauseControlsShowing = false;
      }
      this.gameManager.state = CONFIG.STATES.PLAYING;
    }
  }

  setupTouchControls() {
    this.touchMoving = false;
    this.touchShooting = false;
    this.touchX = 0;

    this.input.on('pointerdown', (pointer) => {
      if (this.isPaused) return;
      if (pointer.x > CONFIG.WIDTH * 0.7) {
        this.touchShooting = true;
      } else {
        this.touchMoving = true;
        this.touchX = pointer.x;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.touchMoving && pointer.isDown && !this.isPaused) {
        this.touchX = pointer.x;
      }
    });

    this.input.on('pointerup', () => {
      this.touchMoving = false;
      this.touchShooting = false;
    });
  }

  update(time, delta) {
    if (this.isPaused) return;
    if (!this.gameManager.isPlaying()) return;

    // Actualizar jugador (con soporte touch)
    this.player.update(time, delta, this.bullets, this.touchMoving, this.touchX, this.touchShooting);

    // Actualizar combo decay
    this.gameManager.score.updateCombo(delta);
    this.events.emit('combo-changed', this.gameManager.score.getComboMultiplier(), this.gameManager.score.getCombo());

    // Parallax de estrellas
    this.starLayers.forEach((stars) => {
      stars.forEach((star) => {
        star.y += star.speedY * (delta / 1000);
        if (star.y > CONFIG.HEIGHT + 5) {
          star.y = -5;
          star.x = Phaser.Math.Between(0, CONFIG.WIDTH);
        }
      });
    });

    // Verificar si wave completa (no boss activo)
    if (!this.bossActive && this.gameManager.waves.isWaveComplete() && !this.waveTransition) {
      this.onWaveComplete();
    }

    // Actualizar HUD
    this.events.emit('score-changed', this.gameManager.getScore());
  }

  shakeCamera(intensity, duration) {
    this.cameras.main.shake(duration, intensity / 1000);
  }

  startNextWave() {
    this.waveTransition = false;
    const nextWave = this.gameManager.waves.currentWave + 1;

    // Desactivar enemigos restantes de la wave anterior
    this.enemies.children.iterate((enemy) => {
      if (enemy && enemy.active) {
        enemy.deactivate();
      }
    });

    if (nextWave > 0 && nextWave % CONFIG.BOSS_EVERY === 0) {
      this.gameManager.waves.currentWave = nextWave;
      // Resetear estado del wave manager para que no interfiera
      this.gameManager.waves.waveActive = false;
      this.gameManager.waves.enemiesRemaining = 0;
      this.gameManager.waves.isSpawning = false;
      this.events.emit('wave-started', nextWave);
      this.spawnBoss();
    } else {
      this.gameManager.waves.startNextWave(this, this.enemies);
      this.gameManager.audio.play('wave');
    }
  }

  spawnBoss() {
    this.bossActive = true;
    const bossLevel = Math.floor(this.gameManager.waves.currentWave / CONFIG.BOSS_EVERY);

    this.events.emit('boss-warning');

    this.time.delayedCall(2000, () => {
      if (!this.gameManager.isPlaying()) return;
      this.boss.spawn(bossLevel);
      this.gameManager.audio.play('wave');
    });
  }

  onBossDead() {
    this.bossActive = false;
    this.shakeCamera(8, 600);

    this.enemyBullets.children.iterate((bullet) => {
      if (bullet && bullet.active) bullet.deactivate();
    });

    // Drop power-up garantizado del boss
    this.powerups.drop(this.boss.x, this.boss.y);
    const activePU = this.powerups.countActive(true);
    if (activePU === 0) {
      const pu = this.powerups.getFirstDead(false);
      if (pu) pu.spawn(this.boss.x, this.boss.y);
    }

    this.waveTransition = true;
    this.time.delayedCall(CONFIG.WAVE_PAUSE, () => {
      if (this.gameManager.isPlaying()) {
        this.startNextWave();
      }
    });
  }

  onWaveComplete() {
    this.waveTransition = true;

    this.enemyBullets.children.iterate((bullet) => {
      if (bullet && bullet.active) bullet.deactivate();
    });

    this.time.delayedCall(CONFIG.WAVE_PAUSE, () => {
      if (this.gameManager.isPlaying()) {
        this.startNextWave();
      }
    });
  }

  onBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    bullet.deactivate();
    const ex = enemy.x, ey = enemy.y, eScore = enemy.scoreValue;
    const killed = enemy.takeDamage();

    if (killed) {
      this.gameManager.waves.onEnemyDestroyed();
      this.killCount++;

      // Drop power-up
      this.powerups.drop(ex, ey);

      // Score con combo
      const earnedPoints = eScore;
      const multiplier = this.gameManager.score.getComboMultiplier();
      const displayPoints = earnedPoints * multiplier;

      // Texto de puntos flotante con color segun combo
      const comboColors = ['#ffff00', '#ffaa00', '#ff6600', '#ff00ff'];
      const color = comboColors[Math.min(multiplier - 1, comboColors.length - 1)];
      const fontSize = multiplier > 1 ? (12 + multiplier * 2) + 'px' : '14px';

      let pointText = '+' + displayPoints;
      if (multiplier > 1) pointText += ' x' + multiplier;

      const scoreText = this.add.text(ex, ey, pointText, {
        fontFamily: CONFIG.FONT_UI,
        fontSize: fontSize,
        color: color,
        fontStyle: multiplier > 1 ? 'bold' : 'normal'
      }).setOrigin(0.5).setDepth(30);

      this.tweens.add({
        targets: scoreText,
        y: ey - 40,
        alpha: 0,
        duration: 700,
        onComplete: () => scoreText.destroy()
      });
    }
  }

  onBulletHitBoss(objA, objB) {
    // Phaser puede invertir parametros en sprite vs grupo
    const bullet = objA.canBeHit ? objB : objA;
    const boss = objA.canBeHit ? objA : objB;
    if (!bullet.active || !boss.active || !boss.canBeHit || !boss.canBeHit()) return;
    bullet.deactivate();
    boss.takeDamage();
  }

  onBulletHitEnemyBullet(playerBullet, enemyBullet) {
    if (!playerBullet.active || !enemyBullet.active) return;
    enemyBullet.deactivate();
    // Chispa pequeña en el punto de colision
    this.gameManager.particles.explode(this, enemyBullet.x, enemyBullet.y, 3);
    // La bala del jugador sigue (atraviesa)
  }

  onEnemyBulletHitPlayer(player, bullet) {
    if (!bullet.active || player.isInvincible || player.isDead) return;
    bullet.deactivate();
    player.takeDamage();
    if (!player.isDead) this.shakeCamera(5, 200);
  }

  onEnemyHitPlayer(player, enemy) {
    if (!enemy.active || player.isInvincible || player.isDead) return;
    enemy.deactivate();
    this.gameManager.waves.onEnemyDestroyed();
    this.gameManager.particles.explode(this, enemy.x, enemy.y);
    player.takeDamage();
    if (!player.isDead) this.shakeCamera(5, 200);
  }

  onBossHitPlayer(objA, objB) {
    const boss = objA.onContactPlayer ? objA : objB;
    const player = objA.onContactPlayer ? objB : objA;
    if (!boss.active || boss.isDead || boss.isEntering || !boss.onContactPlayer) return;
    if (player.isInvincible || player.isDead) return;
    if (!boss.onContactPlayer()) return;
    player.takeDamage();
    if (!player.isDead) this.shakeCamera(5, 200);
  }

  onPlayerCollectPowerUp(player, powerup) {
    if (!powerup.active || player.isDead) return;
    powerup.collect(player);
  }

  onPlayerDead() {
    this.registry.set('lastKills', this.killCount);
    this.gameManager.particles.bigExplosion(this, this.player.x, this.player.y);
    this.shakeCamera(10, 500);
    this.gameManager.audio.stopMusic();
    this.gameManager.gameOver();
    this.gameManager.waves.cleanup(this);
    if (this.boss && this.boss.active) {
      this.boss.cleanup();
      this.boss.deactivate();
    }

    this.time.delayedCall(1500, () => {
      this.scene.stop('UIScene');
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene');
      });
    });
  }

  shutdown() {
    this.events.off('player-dead', this.onPlayerDead, this);
    this.events.off('boss-dead', this.onBossDead, this);
    this.gameManager.waves.cleanup(this);
    if (this.trailTimer) this.trailTimer.remove(false);
    if (this.boss && this.boss.active) {
      this.boss.cleanup();
    }
  }
}
