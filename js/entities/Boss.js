class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.body.setSize(50, 50);
    this.setDepth(8);

    this.hp = 0;
    this.maxHp = 0;
    this.bossLevel = 0;
    this.scoreValue = 0;
    this.attackTimer = null;
    this.attackPattern = 0;
    this.isDead = true;
    this.phase = 1;
    this.attackDelay = 2500;
    this.bossTint = 0xffffff;
    this.bossName = '';
    this.isEntering = true;
    this.moveDir = 1;
    this.moveSpeed = 80;
    this.hitCooldown = 0;

    // UI elements
    this.hpBarBg = null;
    this.hpBarFill = null;
    this.nameText = null;
  }

  _createUI() {
    try {
      if (this.hpBarBg) this.hpBarBg.destroy();
      if (this.hpBarFill) this.hpBarFill.destroy();
      if (this.nameText) this.nameText.destroy();
    } catch (e) {}

    this.hpBarBg = this.scene.add.rectangle(this.x, this.y + 38, 56, 6, 0x333333)
      .setDepth(9);
    this.hpBarFill = this.scene.add.rectangle(this.x, this.y + 38, 56, 6, 0x00ff00)
      .setDepth(9);
    this.nameText = this.scene.add.text(this.x, this.y - 40, this.bossName, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ff6666'
    }).setOrigin(0.5).setDepth(9);
  }

  _updateUI() {
    if (!this.hpBarBg || !this.hpBarFill || !this.nameText) return;
    try {
      const ratio = Math.max(0, this.hp / this.maxHp);
      const barWidth = 56;
      const filledWidth = barWidth * ratio;

      // Posicionar barra centrada debajo del boss
      this.hpBarBg.setPosition(this.x, this.y + 42);
      this.hpBarBg.setSize(barWidth, 6);

      // Barra de relleno alineada a la izquierda
      this.hpBarFill.setPosition(this.x - (barWidth - filledWidth) / 2, this.y + 42);
      this.hpBarFill.setSize(filledWidth, 6);

      if (ratio > 0.5) this.hpBarFill.setFillStyle(0x00ff00);
      else if (ratio > 0.25) this.hpBarFill.setFillStyle(0xffaa00);
      else this.hpBarFill.setFillStyle(0xff0000);

      this.nameText.setPosition(this.x, this.y - 42);
    } catch (e) {
      // Si algo fallo, destruir UI y no intentar mas
      this.hpBarBg = null;
      this.hpBarFill = null;
      this.nameText = null;
    }
  }

  spawn(bossLevel) {
    this.bossLevel = bossLevel;
    this.hp = 30 + (bossLevel * 25);
    this.maxHp = this.hp;
    this.scoreValue = 200 + (bossLevel * 150);
    this.isDead = false;
    this.isEntering = true;
    this.attackPattern = 0;
    this.phase = 1;
    this.hitCooldown = 0;

    this.attackDelay = Math.max(1200, 2500 - bossLevel * 300);
    this.moveSpeed = 80 + bossLevel * 15;

    const tints = [0xffffff, 0xff8800, 0x00ffaa, 0xff00ff, 0xffff00, 0x00aaff];
    this.bossTint = tints[bossLevel % tints.length];

    const names = ['GUARDIAN', 'OVERLORD', 'DESTROYER', 'NEMESIS', 'TITAN', 'COLOSSUS'];
    this.bossName = names[bossLevel % names.length];

    // Limpiar cualquier tween/timer previo
    this.cleanup();

    this.setPosition(CONFIG.WIDTH / 2, -40);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.setAlpha(1);
    this.setTint(this.bossTint);
    this.setScale(1 + bossLevel * 0.1);
    this.setVelocity(0, 0);

    this._createUI();

    // Entrada con velocidad fisica
    this.setVelocityY(60);
    this.moveDir = 1;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active || this.isDead) return;

    // Cooldown de contacto con jugador
    if (this.hitCooldown > 0) {
      this.hitCooldown -= delta;
    }

    // Fase de entrada
    if (this.isEntering) {
      if (this.y >= 80) {
        this.isEntering = false;
        this.setVelocity(0, 0);
        this.startAttacking();
      }
      this._updateUI();
      return;
    }

    // Movimiento horizontal con fisica pura (sin tweens)
    this.setVelocityX(this.moveDir * this.moveSpeed);
    this.setVelocityY(0);

    if (this.x >= CONFIG.WIDTH - 60) {
      this.moveDir = -1;
      this.x = CONFIG.WIDTH - 60;
    } else if (this.x <= 60) {
      this.moveDir = 1;
      this.x = 60;
    }

    this._updateUI();
  }

  startAttacking() {
    if (this.isDead) return;
    this.attackTimer = this.scene.time.addEvent({
      delay: this.attackDelay,
      loop: true,
      callback: () => {
        if (this.isDead || !this.active) return;
        this.attack();
        this.attackPattern++;
      }
    });
  }

  attack() {
    if (!this.scene || !this.scene.enemyBullets) return;
    const bullets = this.scene.enemyBullets;

    if (this.phase === 2) {
      this._doAttack(bullets);
      if (this.scene && this.scene.time) {
        this.scene.time.delayedCall(400, () => {
          if (!this.isDead && this.active && this.scene && this.scene.enemyBullets) {
            this._doAttack(this.scene.enemyBullets);
          }
        });
      }
    } else {
      this._doAttack(bullets);
    }
  }

  _doAttack(bullets) {
    // Mas patrones disponibles segun nivel
    const patterns = ['spread', 'aimed', 'barrage'];
    if (this.bossLevel >= 1) patterns.push('wall', 'spiral');
    if (this.bossLevel >= 2) patterns.push('shotgun', 'cross');
    if (this.bossLevel >= 3) patterns.push('rain', 'helix');
    if (this.bossLevel >= 4) patterns.push('cage');

    const idx = this.attackPattern % patterns.length;
    const name = patterns[idx];

    // Velocidad escala con nivel
    const spdMult = 1 + this.bossLevel * 0.12;

    switch (name) {
      case 'spread':  this.atkSpread(bullets, spdMult); break;
      case 'aimed':   this.atkAimed(bullets, spdMult); break;
      case 'barrage':  this.atkBarrage(bullets, spdMult); break;
      case 'wall':     this.atkWall(bullets, spdMult); break;
      case 'spiral':   this.atkSpiral(bullets, spdMult); break;
      case 'shotgun':  this.atkShotgun(bullets, spdMult); break;
      case 'cross':    this.atkCross(bullets, spdMult); break;
      case 'rain':     this.atkRain(bullets, spdMult); break;
      case 'helix':    this.atkHelix(bullets, spdMult); break;
      case 'cage':     this.atkCage(bullets, spdMult); break;
    }
  }

  _fireBullet(bullets, x, y, vx, vy) {
    const bullet = bullets.getFirstDead(false);
    if (bullet) {
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.lifeTime = 0;
      bullet.setVelocity(vx, vy);
    }
  }

  // --- PATRONES BASE (nivel 1+) ---

  atkSpread(bullets, sm) {
    // Abanico: mas balas y mas ancho con nivel
    const count = 5 + this.bossLevel * 2;
    const arc = 0.6 + this.bossLevel * 0.15;
    const speed = CONFIG.ENEMY_BULLET_SPEED * 1.2 * sm;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / 2) + ((i - (count - 1) / 2) * (arc / count));
      this._fireBullet(bullets, this.x, this.y + 30,
        Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  atkAimed(bullets, sm) {
    // Rafagas dirigidas al jugador: mas balas, mas rapidas
    const player = this.scene.player;
    if (!player || player.isDead) return;
    const count = 3 + this.bossLevel;
    const speed = CONFIG.ENEMY_BULLET_SPEED * 1.3 * sm;
    for (let i = 0; i < count; i++) {
      const ox = (i - (count - 1) / 2) * (12 - this.bossLevel);
      const dx = player.x - (this.x + ox);
      const dy = player.y - (this.y + 30);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) return;
      this._fireBullet(bullets, this.x + ox, this.y + 30,
        (dx / dist) * speed, (dy / dist) * speed);
    }
  }

  atkBarrage(bullets, sm) {
    // Circulo completo: mas balas con nivel
    const count = 8 + this.bossLevel * 3;
    const speed = CONFIG.ENEMY_BULLET_SPEED * sm;
    const offset = this.attackPattern * 0.3;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + offset;
      this._fireBullet(bullets, this.x, this.y + 20,
        Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  // --- PATRONES NIVEL 1+ ---

  atkWall(bullets, sm) {
    // Muro horizontal con huecos aleatorios
    const count = 10 + this.bossLevel * 2;
    const gap = Phaser.Math.Between(2, count - 3);
    const speed = CONFIG.ENEMY_BULLET_SPEED * 1.1 * sm;
    const spacing = (CONFIG.WIDTH - 40) / count;
    for (let i = 0; i < count; i++) {
      if (i === gap || i === gap + 1) continue; // hueco para esquivar
      this._fireBullet(bullets, 20 + i * spacing, this.y + 30, 0, speed);
    }
  }

  atkSpiral(bullets, sm) {
    // Espiral que rota: mas brazos con nivel
    const arms = 3 + this.bossLevel;
    const offset = this.attackPattern * 0.4;
    const speed = CONFIG.ENEMY_BULLET_SPEED * 0.9 * sm;
    for (let i = 0; i < arms; i++) {
      const angle = (Math.PI * 2 / arms) * i + offset;
      this._fireBullet(bullets, this.x, this.y + 20,
        Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  // --- PATRONES NIVEL 2+ ---

  atkShotgun(bullets, sm) {
    // Rafaga concentrada hacia jugador
    const player = this.scene.player;
    if (!player || player.isDead) return;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const baseAngle = Math.atan2(dy, dx);
    const count = 5 + this.bossLevel * 2;
    const spread = 0.08 + this.bossLevel * 0.02;
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i - (count - 1) / 2) * spread;
      const speed = CONFIG.ENEMY_BULLET_SPEED * (1.1 + Math.random() * 0.5) * sm;
      this._fireBullet(bullets, this.x, this.y + 20,
        Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  atkCross(bullets, sm) {
    // Cruz: 4 lineas en + que rotan
    const speed = CONFIG.ENEMY_BULLET_SPEED * 1.1 * sm;
    const offset = this.attackPattern * 0.25;
    const perArm = 2 + Math.floor(this.bossLevel / 2);
    for (let arm = 0; arm < 4; arm++) {
      const baseAngle = (Math.PI / 2) * arm + offset;
      for (let j = 0; j < perArm; j++) {
        const s = speed * (0.7 + j * 0.3);
        this._fireBullet(bullets, this.x, this.y + 20,
          Math.cos(baseAngle) * s, Math.sin(baseAngle) * s);
      }
    }
  }

  // --- PATRONES NIVEL 3+ ---

  atkRain(bullets, sm) {
    // Lluvia: balas caen desde posiciones aleatorias arriba
    const count = 8 + this.bossLevel * 3;
    const speed = CONFIG.ENEMY_BULLET_SPEED * 0.8 * sm;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(25, CONFIG.WIDTH - 25);
      const vx = (Math.random() - 0.5) * 40;
      this._fireBullet(bullets, x, this.y + 20, vx, speed + Math.random() * 50);
    }
  }

  atkHelix(bullets, sm) {
    // Doble helice: dos espirales intercaladas
    const speed = CONFIG.ENEMY_BULLET_SPEED * sm;
    const offset = this.attackPattern * 0.6;
    const count = 4 + this.bossLevel;
    for (let i = 0; i < count; i++) {
      const a1 = (Math.PI * 2 / count) * i + offset;
      const a2 = a1 + Math.PI / count; // offset de media fase
      this._fireBullet(bullets, this.x, this.y + 20,
        Math.cos(a1) * speed, Math.sin(a1) * speed);
      this._fireBullet(bullets, this.x, this.y + 20,
        Math.cos(a2) * speed * 0.7, Math.sin(a2) * speed * 0.7);
    }
  }

  // --- PATRONES NIVEL 4+ ---

  atkCage(bullets, sm) {
    // Jaula: muros desde ambos lados + balas dirigidas
    const speed = CONFIG.ENEMY_BULLET_SPEED * sm;
    const player = this.scene.player;

    // Muros laterales
    for (let i = 0; i < 4; i++) {
      const y = this.y + 20 + i * 8;
      this._fireBullet(bullets, 30, y, speed * 0.5, speed * 0.8);
      this._fireBullet(bullets, CONFIG.WIDTH - 30, y, -speed * 0.5, speed * 0.8);
    }

    // Balas dirigidas al centro
    if (player && !player.isDead) {
      for (let i = 0; i < 3 + this.bossLevel; i++) {
        const ox = (i - 1) * 25;
        const dx = player.x - (this.x + ox);
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          this._fireBullet(bullets, this.x + ox, this.y + 25,
            (dx / dist) * speed * 1.2, (dy / dist) * speed * 1.2);
        }
      }
    }
  }

  canBeHit() {
    return !this.isDead && !this.isEntering && this.hitCooldown <= 0;
  }

  takeDamage() {
    if (!this.canBeHit()) return false;
    this.hp--;
    this.scene.gameManager.audio.play('hit');

    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active && !this.isDead) this.setTint(this.bossTint);
    });

    // Cambio de fase al 50%
    if (this.phase === 1 && this.hp <= this.maxHp * 0.5) {
      this.phase = 2;
      this.moveSpeed *= 1.5;
      if (this.scene.shakeCamera) this.scene.shakeCamera(6, 300);
      if (this.attackTimer) {
        this.attackTimer.remove(false);
      }
      this.attackTimer = this.scene.time.addEvent({
        delay: Math.max(600, this.attackDelay * 0.6),
        loop: true,
        callback: () => {
          if (this.isDead || !this.active) return;
          this.attack();
          this.attackPattern++;
        }
      });
      this.scene.cameras.main.flash(200, 255, 0, 0);
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  onContactPlayer() {
    if (this.hitCooldown > 0) return false;
    this.hitCooldown = 500;
    return true;
  }

  die() {
    this.isDead = true;

    this.scene.gameManager.score.addScore(this.scoreValue);
    this.scene.gameManager.audio.play('explosion');
    this.scene.gameManager.particles.bigExplosion(this.scene, this.x, this.y);

    const explosionCount = 4 + this.bossLevel * 2;
    for (let i = 1; i <= explosionCount; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        if (!this.scene) return;
        const ox = Phaser.Math.Between(-35, 35);
        const oy = Phaser.Math.Between(-35, 35);
        this.scene.gameManager.particles.explode(this.scene, this.x + ox, this.y + oy, 8);
        this.scene.gameManager.audio.play('explosion');
      });
    }

    const txt = this.scene.add.text(this.x, this.y, '+' + this.scoreValue, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    this.scene.tweens.add({
      targets: txt,
      y: this.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy()
    });

    this.cleanup();
    this.deactivate();
    this.scene.events.emit('boss-dead');
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) this.body.enable = false;
    this.setVelocity(0, 0);
    this.setScale(1);
    this.clearTint();
    try {
      if (this.hpBarBg) { this.hpBarBg.destroy(); this.hpBarBg = null; }
      if (this.hpBarFill) { this.hpBarFill.destroy(); this.hpBarFill = null; }
      if (this.nameText) { this.nameText.destroy(); this.nameText = null; }
    } catch (e) {}
  }

  cleanup() {
    this.scene.tweens.killTweensOf(this);
    if (this.attackTimer) {
      this.attackTimer.remove(false);
      this.attackTimer = null;
    }
  }
}
