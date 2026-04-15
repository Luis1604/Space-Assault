class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);
    if (this.body) {
      this.body.setSize(20, 22);
      this.body.setOffset(6, 4);
    }

    this.lives = CONFIG.PLAYER_LIVES;
    this.speed = CONFIG.PLAYER_SPEED;
    this.shootCooldown = CONFIG.BULLET_COOLDOWN;
    this.lastShot = 0;
    this.isInvincible = false;
    this.isDead = false;

    // Power-up state
    this.currentPowerUp = null;
    this.powerUpTimer = null;
    this.powerUpTimeLeft = 0;
    this.powerUpDuration = 0;

    // Shield
    this.hasShield = false;
    this.shieldSprite = scene.add.sprite(x, y, 'shield').setDepth(11).setVisible(false);
    this.shieldTimer = null;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time, delta, bullets, touchMoving, touchX, touchShooting) {
    if (this.isDead) return;

    // Movimiento horizontal (teclado)
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.setVelocityX(this.speed);
    } else if (touchMoving) {
      // Touch: mover hacia donde toca
      const diff = touchX - this.x;
      if (Math.abs(diff) > 8) {
        this.setVelocityX(Math.sign(diff) * this.speed);
      } else {
        this.setVelocityX(0);
      }
    } else {
      this.setVelocityX(0);
    }

    // Actualizar posicion del escudo
    if (this.hasShield) {
      this.shieldSprite.setPosition(this.x, this.y);
    }

    // Cooldown actual (rapid fire lo reduce)
    const cooldown = this.currentPowerUp === 'RAPID_FIRE' ? 100 : this.shootCooldown;

    // Disparo (teclado o touch)
    const shooting = this.keySpace.isDown || touchShooting;
    if (shooting && time > this.lastShot + cooldown) {
      this.shoot(bullets);
      this.lastShot = time;
    }

    // Actualizar timer de power-up
    if (this.currentPowerUp && this.powerUpTimer) {
      this.powerUpTimeLeft -= delta;
      this.scene.events.emit('powerup-timer', this.currentPowerUp, this.powerUpTimeLeft, this.powerUpDuration);
    }
  }

  shoot(bullets) {
    switch (this.currentPowerUp) {
      case 'DOUBLE_SHOT':
        bullets.fire(this.x - 8, this.y - 16);
        bullets.fire(this.x + 8, this.y - 16);
        break;

      case 'TRIPLE_SHOT':
        bullets.fire(this.x, this.y - 16);
        // Balas laterales en angulo
        const leftBullet = bullets.getPool().getFirstDead(false);
        if (leftBullet) {
          leftBullet.fire(this.x - 10, this.y - 12);
          leftBullet.setVelocity(-60, -CONFIG.BULLET_SPEED);
        }
        const rightBullet = bullets.getPool().getFirstDead(false);
        if (rightBullet) {
          rightBullet.fire(this.x + 10, this.y - 12);
          rightBullet.setVelocity(60, -CONFIG.BULLET_SPEED);
        }
        break;

      default:
        bullets.fire(this.x, this.y - 16);
        break;
    }
    this.scene.gameManager.audio.play('shoot');
  }

  setPowerUp(type, duration) {
    // Limpiar power-up anterior
    this.clearPowerUp();

    this.currentPowerUp = type;
    this.powerUpDuration = duration;
    this.powerUpTimeLeft = duration;

    this.powerUpTimer = this.scene.time.delayedCall(duration, () => {
      this.clearPowerUp();
    });
  }

  clearPowerUp() {
    if (this.powerUpTimer) {
      this.powerUpTimer.remove(false);
      this.powerUpTimer = null;
    }
    this.currentPowerUp = null;
    this.powerUpTimeLeft = 0;
    this.powerUpDuration = 0;
    this.scene.events.emit('powerup-timer', null, 0, 0);
  }

  setShield(duration) {
    this.hasShield = true;
    this.shieldSprite.setVisible(true);
    this.shieldSprite.setPosition(this.x, this.y);
    this.shieldSprite.setAlpha(0.7);

    // Pulso del escudo
    this.scene.tweens.add({
      targets: this.shieldSprite,
      alpha: { from: 0.4, to: 0.8 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    if (this.shieldTimer) this.shieldTimer.remove(false);
    this.shieldTimer = this.scene.time.delayedCall(duration, () => {
      this.removeShield();
    });
  }

  removeShield() {
    this.hasShield = false;
    this.shieldSprite.setVisible(false);
    this.scene.tweens.killTweensOf(this.shieldSprite);
    if (this.shieldTimer) {
      this.shieldTimer.remove(false);
      this.shieldTimer = null;
    }
  }

  takeDamage() {
    if (this.isInvincible || this.isDead) return;

    // El escudo absorbe un golpe
    if (this.hasShield) {
      this.removeShield();
      this.scene.gameManager.audio.play('hit');
      return;
    }

    this.lives--;
    this.scene.gameManager.audio.play('hit');
    this.scene.events.emit('lives-changed', this.lives);

    if (this.lives <= 0) {
      this.die();
      return;
    }

    // Invencibilidad temporal
    this.isInvincible = true;
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.2, to: 1 },
      duration: 150,
      repeat: 5,
      onComplete: () => {
        this.isInvincible = false;
        this.setAlpha(1);
      }
    });
  }

  die() {
    this.isDead = true;
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.clearPowerUp();
    this.removeShield();
    this.scene.events.emit('player-dead');
  }

  reset() {
    this.setPosition(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 70);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.lives = CONFIG.PLAYER_LIVES;
    this.isInvincible = false;
    this.isDead = false;
    this.setAlpha(1);
    this.setVelocity(0, 0);
    this.clearPowerUp();
    this.removeShield();
  }
}
