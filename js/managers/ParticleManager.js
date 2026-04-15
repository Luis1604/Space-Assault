class ParticleManager {
  explode(scene, x, y, count) {
    count = count || 10;
    for (let i = 0; i < count; i++) {
      const particle = scene.add.sprite(x, y, 'particle');
      particle.setDepth(20);

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Color aleatorio entre naranja y amarillo
      const colors = [0xffaa00, 0xff6600, 0xffff00, 0xff4400, 0xffffff];
      particle.setTint(colors[Math.floor(Math.random() * colors.length)]);

      const scale = 0.5 + Math.random() * 1;
      particle.setScale(scale);

      scene.tweens.add({
        targets: particle,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 300 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  bigExplosion(scene, x, y) {
    this.explode(scene, x, y, 25);

    // Flash blanco
    const flash = scene.add.circle(x, y, 20, 0xffffff, 0.8);
    flash.setDepth(25);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
  }
}
