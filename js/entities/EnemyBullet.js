class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy-bullet');
    this.setActive(false);
    this.setVisible(false);
    this.lifeTime = 0;
  }

  fire(x, y) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    if (this.body) this.body.enable = true;
    this.lifeTime = 0;
    this.setVelocityY(CONFIG.ENEMY_BULLET_SPEED);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    this.lifeTime += delta;

    // Desactivar si: fuera de pantalla, timeout, o body deshabilitado (stuck)
    const outOfBounds = this.y > CONFIG.HEIGHT + 30 || this.y < -30 ||
                        this.x < -30 || this.x > CONFIG.WIDTH + 30;
    const timeout = this.lifeTime > 4000;
    const stuck = this.body && !this.body.enable;
    const noVelocity = this.body && this.lifeTime > 500 &&
                       Math.abs(this.body.velocity.x) < 1 && Math.abs(this.body.velocity.y) < 1;

    if (outOfBounds || timeout || stuck || noVelocity) {
      this.deactivate();
    }
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
      this.body.velocity.set(0, 0);
    }
    this.setPosition(-100, -100);
    this.lifeTime = 0;
  }
}

class EnemyBulletPool extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene, {
      classType: EnemyBullet,
      maxSize: CONFIG.ENEMY_BULLET_POOL_SIZE,
      runChildUpdate: true
    });

    this.createMultiple({
      key: 'enemy-bullet',
      quantity: CONFIG.ENEMY_BULLET_POOL_SIZE,
      active: false,
      visible: false
    });

    this.children.iterate((bullet) => {
      if (bullet && bullet.body) bullet.body.enable = false;
    });

    // Limpieza periodica: cada 2s buscar balas visibles pero inactivas (stuck)
    scene.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        this.children.iterate((bullet) => {
          if (!bullet) return;
          // Bala visible pero inactiva = stuck
          if (bullet.visible && !bullet.active) {
            bullet.setVisible(false);
            bullet.setPosition(-100, -100);
          }
          // Bala activa pero sin body o body deshabilitado = stuck
          if (bullet.active && (!bullet.body || !bullet.body.enable)) {
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.setPosition(-100, -100);
          }
        });
      }
    });
  }

  fire(x, y) {
    const bullet = this.getFirstDead(false);
    if (bullet) {
      bullet.fire(x, y);
    }
  }
}
