class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x, y) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    if (this.body) this.body.enable = true;
    this.setVelocityY(-CONFIG.BULLET_SPEED);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y < -10) {
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
  }
}

class BulletPool extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene, {
      classType: Bullet,
      maxSize: CONFIG.BULLET_POOL_SIZE,
      runChildUpdate: true
    });

    this.createMultiple({
      key: 'bullet',
      quantity: CONFIG.BULLET_POOL_SIZE,
      active: false,
      visible: false
    });

    this.children.iterate((bullet) => {
      if (bullet && bullet.body) {
        bullet.body.enable = false;
      }
    });
  }

  fire(x, y) {
    const bullet = this.getFirstDead(false);
    if (bullet) {
      bullet.fire(x, y);
    }
  }

  getPool() {
    return this;
  }
}
