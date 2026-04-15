class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'powerup-double');
    this.setActive(false);
    this.setVisible(false);
    this.powerType = null;
  }

  spawn(x, y) {
    const types = PowerUp.TYPES;
    const typeKeys = Object.keys(types);
    const chosen = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const config = types[chosen];

    this.powerType = chosen;
    this.setTexture(config.texture);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.setVelocityY(CONFIG.POWERUP_FALL_SPEED);

    // Rotacion lenta y pulso
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 3000,
      repeat: -1
    });
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y > CONFIG.HEIGHT + 20) {
      this.deactivate();
    }
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) this.body.enable = false;
    this.setVelocity(0, 0);
    this.setAngle(0);
    this.setScale(1);
    this.scene.tweens.killTweensOf(this);
  }

  collect(player) {
    const type = this.powerType;
    const scene = this.scene;

    scene.gameManager.audio.play('powerup');

    switch (type) {
      case 'DOUBLE_SHOT':
        player.setPowerUp('DOUBLE_SHOT', CONFIG.POWERUP_DURATION.DOUBLE_SHOT);
        break;
      case 'TRIPLE_SHOT':
        player.setPowerUp('TRIPLE_SHOT', CONFIG.POWERUP_DURATION.TRIPLE_SHOT);
        break;
      case 'RAPID_FIRE':
        player.setPowerUp('RAPID_FIRE', CONFIG.POWERUP_DURATION.RAPID_FIRE);
        break;
      case 'SHIELD':
        player.setShield(CONFIG.POWERUP_DURATION.SHIELD);
        break;
      case 'EXTRA_LIFE':
        if (player.lives < 5) {
          player.lives++;
          scene.events.emit('lives-changed', player.lives);
        }
        break;
    }

    // Texto flotante del power-up
    const label = PowerUp.TYPES[type].label;
    const color = PowerUp.TYPES[type].color;
    const txt = scene.add.text(this.x, this.y, label, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    scene.tweens.add({
      targets: txt,
      y: this.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => txt.destroy()
    });

    this.deactivate();
  }
}

PowerUp.TYPES = {
  DOUBLE_SHOT: { texture: 'powerup-double', label: 'DOUBLE!', color: '#ff8800' },
  TRIPLE_SHOT: { texture: 'powerup-triple', label: 'TRIPLE!', color: '#00ffff' },
  RAPID_FIRE:  { texture: 'powerup-rapid',  label: 'RAPID!',  color: '#ffff00' },
  SHIELD:      { texture: 'powerup-shield', label: 'SHIELD!', color: '#4488ff' },
  EXTRA_LIFE:  { texture: 'powerup-life',   label: '+1 LIFE', color: '#33ff33' }
};

class PowerUpPool extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene, {
      classType: PowerUp,
      maxSize: 10,
      runChildUpdate: true
    });

    this.createMultiple({
      key: 'powerup-double',
      quantity: 10,
      active: false,
      visible: false
    });

    this.children.iterate((pu) => {
      if (pu) pu.body.enable = false;
    });
  }

  drop(x, y) {
    if (Math.random() > CONFIG.POWERUP_DROP_CHANCE) return;
    const pu = this.getFirstDead(false);
    if (pu) {
      pu.spawn(x, y);
    }
  }
}
