class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture || 'enemy-basic');
    this.setActive(false);
    this.setVisible(false);

    this.hp = 1;
    this.maxHp = 1;
    this.speed = 60;
    this.scoreValue = 10;
    this.shootChance = 0.002;
    this.pattern = 'zigzag';
    this.spawnX = x;
    this.moveTime = 0;
    this.enemyType = 'BASIC';
    this.patternAmplitude = 100;
    this.patternFreq = 1;
    this.diveTarget = null;

    // Parametros extra para movimiento organico
    this.phaseOffset = 0;
    this.wobble = 0;
    this.targetVx = 0;
    this.targetVy = 0;
    this.strafeDir = 1;
    this.strafeTimer = 0;
    this.hasEnteredScreen = false;
    this.entryEase = 0;
  }

  spawn(x, y, type, speedMultiplier) {
    const config = CONFIG.ENEMY_TYPES[type];
    this.enemyType = type;
    this.setTexture(config.key);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.body.setCollideWorldBounds(false);
    this.body.setBounce(0);

    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed * (speedMultiplier || 1);
    this.scoreValue = config.score;
    this.shootChance = config.shootChance * Math.min(speedMultiplier || 1, 2.5);
    this.spawnX = x;
    this.moveTime = Math.random() * Math.PI * 2;
    this.setAlpha(1);
    this.diveTarget = null;
    this.hasEnteredScreen = false;
    this.entryEase = 0;

    // Cada enemigo tiene parametros unicos para que no se muevan igual
    this.phaseOffset = Math.random() * Math.PI * 2;
    this.patternAmplitude = 50 + Math.random() * 100;
    this.patternFreq = 0.6 + Math.random() * 1.2;
    this.wobble = 0.3 + Math.random() * 0.7;
    this.strafeDir = Math.random() > 0.5 ? 1 : -1;
    this.strafeTimer = 0;

    this._assignPattern(type);
    this.setVelocity(0, this.speed * 0.5);
  }

  _assignPattern(type) {
    switch (type) {
      case 'BASIC': {
        const r = Math.random();
        if (r < 0.25) this.pattern = 'weave';
        else if (r < 0.45) this.pattern = 'drift';
        else if (r < 0.65) this.pattern = 'swoopdown';
        else if (r < 0.8) this.pattern = 'strafe_stop';
        else this.pattern = 'lazy_s';
        break;
      }
      case 'FAST': {
        const r = Math.random();
        if (r < 0.3) this.pattern = 'dive_curve';
        else if (r < 0.5) this.pattern = 'kamikaze';
        else if (r < 0.7) this.pattern = 'flanker';
        else this.pattern = 'juke';
        break;
      }
      case 'TANK': {
        const r = Math.random();
        if (r < 0.35) this.pattern = 'weave';
        else if (r < 0.65) this.pattern = 'drift';
        else this.pattern = 'bulldozer';
        break;
      }
      case 'SPLITTER': {
        const r = Math.random();
        if (r < 0.5) this.pattern = 'weave';
        else this.pattern = 'swoopdown';
        break;
      }
      case 'SNIPER': {
        this.pattern = 'sniper_hover';
        break;
      }
      case 'SWARM': {
        const r = Math.random();
        if (r < 0.4) this.pattern = 'juke';
        else if (r < 0.7) this.pattern = 'kamikaze';
        else this.pattern = 'flanker';
        break;
      }
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active || !this.body || !this.scene) return;

    const dt = delta / 1000;
    this.moveTime += dt * this.patternFreq;
    this.entryEase = Math.min(1, this.entryEase + dt * 1.5);

    if (!this.hasEnteredScreen && this.y > 10) {
      this.hasEnteredScreen = true;
    }

    // Easing de entrada: los primeros frames van suave
    const ease = this.entryEase;

    switch (this.pattern) {

      // --- WEAVE: Curvas suaves organicas con doble seno ---
      case 'weave': {
        const t = this.moveTime + this.phaseOffset;
        const vx = (Math.sin(t * 1.8) * 0.6 + Math.sin(t * 3.1 + 1.0) * 0.4) * this.patternAmplitude * ease;
        this.setVelocityX(vx);
        this.setVelocityY(this.speed * (0.8 + Math.sin(t * 0.7) * 0.2));
        // Inclinar sprite segun direccion
        this.setAngle(vx * 0.08);
        break;
      }

      // --- DRIFT: Baja lento con deriva lateral natural ---
      case 'drift': {
        const t = this.moveTime + this.phaseOffset;
        const drift = Math.sin(t * 0.5) * 35 + Math.cos(t * 1.3) * 15;
        this.setVelocityX(drift * ease);
        this.setVelocityY(this.speed * (0.9 + this.wobble * 0.15 * Math.sin(t * 2)));
        this.setAngle(drift * 0.05);
        break;
      }

      // --- LAZY_S: Curva S amplia y elegante ---
      case 'lazy_s': {
        const progress = Math.max(0, (this.y + 60) / (CONFIG.HEIGHT + 120));
        const sX = Math.sin(progress * Math.PI * 2 + this.phaseOffset) * (this.patternAmplitude + 40);
        const targetX = this.spawnX + sX;
        const dx = targetX - this.x;
        this.setVelocityX(dx * 2.5 * ease);
        this.setVelocityY(this.speed);
        this.setAngle(dx * 0.04);
        break;
      }

      // --- SWOOP DOWN: Baja en arco, luego se lanza ---
      case 'swoopdown': {
        const t = this.moveTime;
        if (this.y < CONFIG.HEIGHT * 0.35) {
          // Fase 1: arco lateral
          const arc = Math.sin(t * 1.5 + this.phaseOffset) * this.patternAmplitude * 1.3;
          this.setVelocityX(arc * ease);
          this.setVelocityY(this.speed * 0.7);
          this.setAngle(arc * 0.06);
        } else {
          // Fase 2: acelera hacia abajo con drift
          this.setVelocityY(this.speed * (1.5 + (this.y / CONFIG.HEIGHT) * 0.8));
          this.setVelocityX(this.body.velocity.x * 0.97);
          this.setAngle(this.body.velocity.x * 0.03);
        }
        break;
      }

      // --- STRAFE_STOP: Baja, para, se mueve lateral, sigue ---
      case 'strafe_stop': {
        this.strafeTimer += dt;
        // Despues de 8s, baja directo
        if (this.strafeTimer > 8) {
          this.setVelocityY(this.speed * 2);
          this.setVelocityX(0);
          break;
        }
        const cycle = this.strafeTimer % 3.5;
        if (cycle < 1.2) {
          this.setVelocityY(this.speed);
          this.setVelocityX(this.body.velocity.x * 0.9);
        } else if (cycle < 2.8) {
          this.setVelocityY(this.speed * 0.1);
          const lateralSpeed = this.strafeDir * this.patternAmplitude * 1.5;
          this.setVelocityX(lateralSpeed);
          if (this.x < 30) this.strafeDir = 1;
          if (this.x > CONFIG.WIDTH - 30) this.strafeDir = -1;
        } else {
          this.setVelocityY(this.speed * 0.5);
          this.setVelocityX(this.body.velocity.x * 0.85);
          if (cycle > 3.3) this.strafeDir *= -1;
        }
        this.setAngle(this.body.velocity.x * 0.04);
        break;
      }

      // --- DIVE CURVE: Baja en curva acelerada ---
      case 'dive_curve': {
        const t = this.moveTime + this.phaseOffset;
        if (this.y < CONFIG.HEIGHT * 0.2) {
          this.setVelocityX(Math.sin(t * 2) * 60 * ease);
          this.setVelocityY(this.speed);
        } else {
          // Curva acelerada
          const accel = 1 + (this.y - CONFIG.HEIGHT * 0.2) / CONFIG.HEIGHT * 3;
          this.setVelocityY(this.speed * accel);
          const curve = Math.sin(t * 1.5 + 2) * 80 * this.wobble;
          this.setVelocityX(curve);
          this.setAngle(curve * 0.1);
        }
        break;
      }

      // --- KAMIKAZE: Apunta al jugador con curva ---
      case 'kamikaze': {
        const spd = this.speed * 2.2;
        if (!this.diveTarget && this.y > 20) {
          const p = this.scene ? this.scene.player : null;
          if (p && !p.isDead && p.body) {
            const px = p.x + (p.body.velocity ? p.body.velocity.x * 0.3 : 0);
            this.diveTarget = { x: px, y: p.y };
          } else {
            this.diveTarget = { x: CONFIG.WIDTH / 2, y: CONFIG.HEIGHT + 50 };
          }
        }
        if (this.diveTarget) {
          const dx = this.diveTarget.x - this.x;
          const dy = this.diveTarget.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5 && this.body && this.body.velocity) {
            const curVx = this.body.velocity.x;
            const curVy = this.body.velocity.y;
            const tVx = (dx / dist) * spd;
            const tVy = (dy / dist) * spd;
            this.setVelocity(
              curVx + (tVx - curVx) * 0.08,
              curVy + (tVy - curVy) * 0.08
            );
          } else if (dist <= 5) {
            this.setVelocity(0, spd);
          }
          this.setAngle(this.body.velocity.x * 0.06);
        } else {
          this.setVelocityY(spd);
        }
        break;
      }

      // --- FLANKER: Entra por un lado, cruza y sale ---
      case 'flanker': {
        const t = this.moveTime;
        const dir = this.spawnX < CONFIG.WIDTH / 2 ? 1 : -1;
        if (this.y < CONFIG.HEIGHT * 0.3) {
          this.setVelocityX(dir * this.speed * 1.2 * ease);
          this.setVelocityY(this.speed * 0.8);
        } else {
          // Curvea hacia abajo
          this.setVelocityX(dir * this.speed * 0.6 * Math.cos(t * 1.5));
          this.setVelocityY(this.speed * 1.3);
        }
        this.setAngle(this.body.velocity.x * 0.06);
        break;
      }

      // --- JUKE: Zigzag rapido con cambios de direccion bruscos ---
      case 'juke': {
        this.strafeTimer += dt;
        const interval = 0.4 + this.wobble * 0.4;
        if (this.strafeTimer > interval) {
          this.strafeTimer = 0;
          this.strafeDir *= -1;
        }
        const targetVx = this.strafeDir * this.patternAmplitude * 2;
        const curVx = this.body.velocity.x;
        this.setVelocityX(curVx + (targetVx - curVx) * 0.15);
        this.setVelocityY(this.speed * (1 + this.wobble * 0.3));
        this.setAngle(this.body.velocity.x * 0.08);
        break;
      }

      // --- BULLDOZER: Avanza lento, implacable, apenas esquiva ---
      case 'bulldozer': {
        const t = this.moveTime + this.phaseOffset;
        this.setVelocityX(Math.sin(t * 0.6) * 25);
        this.setVelocityY(this.speed * 0.85);
        this.setAngle(0);
        break;
      }

      // --- SNIPER HOVER: Baja, se posiciona y dispara, luego se va ---
      case 'sniper_hover': {
        const t = this.moveTime + this.phaseOffset;
        // Despues de 10s, baja y se va
        if (this.moveTime > 10) {
          this.setVelocityY(this.speed * 2);
          this.setVelocityX(0);
          this.setAngle(0);
          break;
        }
        if (this.y < CONFIG.HEIGHT * 0.18) {
          this.setVelocityY(this.speed);
          this.setVelocityX(0);
        } else if (this.y < CONFIG.HEIGHT * 0.35) {
          this.setVelocityY(5 + Math.sin(t * 0.4) * 8);
          const lateral = Math.sin(t * 0.7) * 70 + Math.cos(t * 1.9) * 30;
          this.setVelocityX(lateral);
          this.setAngle(lateral * 0.04);
          if (this.x < 30) this.setVelocityX(Math.abs(this.body.velocity.x));
          if (this.x > CONFIG.WIDTH - 30) this.setVelocityX(-Math.abs(this.body.velocity.x));
        } else {
          // Bajo demasiado, acelerar hacia abajo para salir
          this.setVelocityY(this.speed * 2);
          this.setVelocityX(0);
        }
        break;
      }
    }

    // --- Disparo ---
    let shootMod = 1;
    if (this.y > CONFIG.HEIGHT * 0.15 && this.y < CONFIG.HEIGHT * 0.65) {
      shootMod = 1.8;
    }
    if (this.scene.enemyBullets && Math.random() < this.shootChance * shootMod * dt * 60 && this.y > 15 && this.y < CONFIG.HEIGHT * 0.75) {
      const p = this.scene.player;
      if (this.enemyType === 'SNIPER' && p && !p.isDead && p.body) {
        const bullet = this.scene.enemyBullets.getFirstDead(false);
        if (bullet && bullet.body) {
          bullet.setPosition(this.x, this.y + 14);
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.body.enable = true;
          bullet.lifeTime = 0;
          const dx = p.x - this.x;
          const dy = p.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1) {
            const spd = CONFIG.ENEMY_BULLET_SPEED * 1.5;
            bullet.setVelocity((dx / dist) * spd, (dy / dist) * spd);
          }
        }
      } else {
        this.scene.enemyBullets.fire(this.x, this.y + 14);
      }
    }

    // Fuera de pantalla o lleva demasiado tiempo vivo
    const tooOld = this.moveTime > 12;
    const outScreen = this.y > CONFIG.HEIGHT - 30 || this.x < -50 || this.x > CONFIG.WIDTH + 50;

    if (outScreen || tooOld) {
      this.deactivate();
      if (this.scene && this.scene.gameManager) {
        this.scene.gameManager.waves.onEnemyDestroyed();
      }
    }
  }

  takeDamage() {
    if (!this.scene || !this.scene.gameManager) return false;
    this.hp--;
    this.scene.gameManager.audio.play('hit');

    this.setTint(0xffffff);
    if (this.scene.time) {
      this.scene.time.delayedCall(60, () => {
        if (this.active) this.clearTint();
      });
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.scene.gameManager.score.addScore(this.scoreValue);
    this.scene.gameManager.audio.play('explosion');
    this.scene.gameManager.particles.explode(this.scene, this.x, this.y);

    if (this.enemyType === 'SPLITTER' && this.scene.enemies) {
      const offsets = [-18, 18];
      offsets.forEach((ox) => {
        this.scene.enemies.spawn(
          this.x + ox, this.y,
          'SWARM',
          this.speed / CONFIG.ENEMY_TYPES.SWARM.speed
        );
      });
    }

    this.deactivate();
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.setAngle(0);
    if (this.body) {
      this.body.enable = false;
      this.body.velocity.set(0, 0);
    }
    this.setPosition(-100, -100);
  }
}

class EnemyPool extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene, {
      classType: Enemy,
      maxSize: CONFIG.ENEMY_POOL_SIZE,
      runChildUpdate: true
    });

    this.createMultiple({
      key: 'enemy-basic',
      quantity: CONFIG.ENEMY_POOL_SIZE,
      active: false,
      visible: false
    });

    this.children.iterate((enemy) => {
      if (enemy) enemy.body.enable = false;
    });
  }

  spawn(x, y, type, speedMultiplier) {
    const enemy = this.getFirstDead(false);
    if (enemy) enemy.spawn(x, y, type, speedMultiplier);
    return enemy;
  }

  getActiveCount() {
    return this.countActive(true);
  }
}
