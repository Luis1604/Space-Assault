class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.generatePlayerTexture();
    this.generateBulletTexture();
    this.generateEnemyBasicTexture();
    this.generateEnemyFastTexture();
    this.generateEnemyTankTexture();
    this.generateEnemyBulletTexture();
    this.generateStarTexture();
    this.generateExplosionParticle();
    this.generateLifeIcon();
    this.generateEnemySplitterTexture();
    this.generateEnemySniperTexture();
    this.generateEnemySwarmTexture();
    this.generatePowerUpTextures();
    this.generateBossTexture();
    this.generateShieldTexture();
    this.generateMenuShip();

    this.scene.start('MenuScene');
  }

  generatePlayerTexture() {
    const g = this.textures.createCanvas('player', 32, 32);
    const ctx = g.getContext();
    ctx.imageSmoothingEnabled = false;

    // Colores
    const B = '#00aaff';
    const L = '#55ddff';
    const W = '#ffffff';
    const D = '#0066aa';
    const G = '#003355';
    const O = '#ff6600';
    const Y = '#ffaa00';
    const R = '#ff2200';
    const C = '#99eeff';

    function px(x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }

    // Punta (filas 1-4)
    px(15,1,L); px(16,1,L);
    px(14,2,B); px(15,2,W); px(16,2,W); px(17,2,B);
    px(14,3,D); px(15,3,L); px(16,3,L); px(17,3,D);
    px(13,4,D); px(14,4,B); px(15,4,C); px(16,4,C); px(17,4,B); px(18,4,D);

    // Cockpit (filas 5-7)
    px(12,5,G); px(13,5,D); px(14,5,L); px(15,5,W); px(16,5,W); px(17,5,L); px(18,5,D); px(19,5,G);
    px(12,6,G); px(13,6,D); px(14,6,C); px(15,6,W); px(16,6,W); px(17,6,C); px(18,6,D); px(19,6,G);
    px(11,7,G); px(12,7,D); px(13,7,B); px(14,7,L); px(15,7,C); px(16,7,C); px(17,7,L); px(18,7,B); px(19,7,D); px(20,7,G);

    // Cuerpo (filas 8-11)
    for (let x = 10; x <= 21; x++) px(x, 8, x===10||x===21 ? G : x===11||x===20 ? D : x===14||x===17 ? L : B);
    for (let x = 9; x <= 22; x++) px(x, 9, x===9||x===22 ? G : x===10||x===21 ? D : B);
    for (let x = 8; x <= 23; x++) px(x, 10, x===8||x===23 ? G : x===9||x===22 ? D : x===12||x===19 ? L : B);
    for (let x = 7; x <= 24; x++) px(x, 11, x===7||x===24 ? G : x===8||x===23 ? D : x===11||x===20 ? L : B);

    // Alas (filas 12-16)
    for (let x = 5; x <= 26; x++) px(x, 12, x<=5||x>=26 ? G : x<=6||x>=25 ? D : x===10||x===21 ? L : x>=13&&x<=18 ? D : B);
    for (let x = 4; x <= 27; x++) px(x, 13, x<=4||x>=27 ? G : x<=5||x>=26 ? D : x===9||x===22 ? L : x>=13&&x<=18 ? D : B);
    for (let x = 3; x <= 28; x++) px(x, 14, x<=3||x>=28 ? G : x<=4||x>=27 ? D : x===8||x===23 ? L : x>=14&&x<=17 ? B : x>=12&&x<=19 ? D : B);
    for (let x = 2; x <= 29; x++) px(x, 15, x<=2||x>=29 ? G : x<=3||x>=28 ? D : x===7||x===24 ? L : x>=14&&x<=17 ? B : x>=12&&x<=19 ? D : B);
    for (let x = 2; x <= 29; x++) px(x, 16, x<=2||x>=29 ? G : x<=3||x>=28 ? D : x>=14&&x<=17 ? B : x>=12&&x<=19 ? G : x<=5||x>=26 ? G : D);

    // Cola (filas 17-19)
    px(2,17,G); px(3,17,D); px(4,17,D); px(5,17,G);
    px(13,17,D); px(14,17,B); px(15,17,B); px(16,17,B); px(17,17,B); px(18,17,D);
    px(26,17,G); px(27,17,D); px(28,17,D); px(29,17,G);

    px(3,18,G); px(4,18,G);
    px(14,18,D); px(15,18,D); px(16,18,D); px(17,18,D);
    px(27,18,G); px(28,18,G);

    // Motor central
    px(14,19,O); px(15,19,Y); px(16,19,Y); px(17,19,O);
    px(14,20,R); px(15,20,O); px(16,20,O); px(17,20,R);
    px(15,21,R); px(16,21,R);

    // Motores laterales
    px(3,19,O); px(4,19,Y);
    px(3,20,R); px(4,20,O);
    px(27,19,Y); px(28,19,O);
    px(27,20,O); px(28,20,R);

    g.refresh();
  }

  generateBulletTexture() {
    const g = this.textures.createCanvas('bullet', 4, 14);
    const ctx = g.getContext();

    ctx.fillStyle = '#ffff00';
    ctx.fillRect(0, 2, 4, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, 0, 2, 4);

    g.refresh();
  }

  generateEnemyBasicTexture() {
    const g = this.textures.createCanvas('enemy-basic', 28, 28);
    const ctx = g.getContext();

    // Cuerpo cuadrado verde
    ctx.fillStyle = '#33cc33';
    ctx.fillRect(4, 4, 20, 20);

    // Ojos
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 10, 4, 4);
    ctx.fillRect(16, 10, 4, 4);

    // Boca
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 18, 8, 2);

    // Antenas
    ctx.fillStyle = '#33cc33';
    ctx.fillRect(6, 0, 2, 6);
    ctx.fillRect(20, 0, 2, 6);

    g.refresh();
  }

  generateEnemyFastTexture() {
    const g = this.textures.createCanvas('enemy-fast', 24, 24);
    const ctx = g.getContext();

    // Triangulo rojo invertido
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.moveTo(12, 22);
    ctx.lineTo(2, 2);
    ctx.lineTo(22, 2);
    ctx.closePath();
    ctx.fill();

    // Ojo central
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(12, 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(12, 10, 1.5, 0, Math.PI * 2);
    ctx.fill();

    g.refresh();
  }

  generateEnemyTankTexture() {
    const g = this.textures.createCanvas('enemy-tank', 32, 32);
    const ctx = g.getContext();

    // Hexagono morado
    ctx.fillStyle = '#9933ff';
    ctx.beginPath();
    ctx.moveTo(16, 2);
    ctx.lineTo(28, 9);
    ctx.lineTo(28, 23);
    ctx.lineTo(16, 30);
    ctx.lineTo(4, 23);
    ctx.lineTo(4, 9);
    ctx.closePath();
    ctx.fill();

    // Borde mas claro
    ctx.strokeStyle = '#cc66ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ojos amenazantes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(9, 12, 5, 3);
    ctx.fillRect(18, 12, 5, 3);

    // Boca
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(11, 20, 10, 2);

    g.refresh();
  }

  generateEnemyBulletTexture() {
    const g = this.textures.createCanvas('enemy-bullet', 6, 6);
    const ctx = g.getContext();

    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(3, 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.arc(3, 2, 1, 0, Math.PI * 2);
    ctx.fill();

    g.refresh();
  }

  generateStarTexture() {
    const g = this.textures.createCanvas('star', 2, 2);
    const ctx = g.getContext();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2, 2);

    g.refresh();
  }

  generateExplosionParticle() {
    const g = this.textures.createCanvas('particle', 4, 4);
    const ctx = g.getContext();

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(0, 0, 4, 4);

    g.refresh();
  }

  generateLifeIcon() {
    const g = this.textures.createCanvas('life-icon', 16, 16);
    const ctx = g.getContext();

    // Mini nave simplificada
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.lineTo(14, 13);
    ctx.lineTo(8, 10);
    ctx.lineTo(2, 13);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#44ddff';
    ctx.beginPath();
    ctx.moveTo(8, 3);
    ctx.lineTo(10, 10);
    ctx.lineTo(8, 8);
    ctx.lineTo(6, 10);
    ctx.closePath();
    ctx.fill();

    // Motores
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(4, 13, 2, 2);
    ctx.fillRect(10, 13, 2, 2);

    g.refresh();
  }

  generateEnemySplitterTexture() {
    const g = this.textures.createCanvas('enemy-splitter', 28, 28);
    const ctx = g.getContext();

    // Diamante naranja
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(14, 1);
    ctx.lineTo(27, 14);
    ctx.lineTo(14, 27);
    ctx.lineTo(1, 14);
    ctx.closePath();
    ctx.fill();

    // Linea de division
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, 4);
    ctx.lineTo(14, 24);
    ctx.stroke();

    // Ojos
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 11, 3, 3);
    ctx.fillRect(17, 11, 3, 3);

    g.refresh();
  }

  generateEnemySniperTexture() {
    const g = this.textures.createCanvas('enemy-sniper', 24, 28);
    const ctx = g.getContext();

    // Cuerpo alargado azul oscuro
    ctx.fillStyle = '#2244aa';
    ctx.fillRect(6, 2, 12, 24);

    // Canon largo
    ctx.fillStyle = '#4466cc';
    ctx.fillRect(9, 22, 6, 6);

    // Ojo de mira (circulo rojo)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(12, 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(12, 10, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cruz de mira
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 3);
    ctx.lineTo(12, 17);
    ctx.moveTo(5, 10);
    ctx.lineTo(19, 10);
    ctx.stroke();

    g.refresh();
  }

  generateEnemySwarmTexture() {
    const g = this.textures.createCanvas('enemy-swarm', 18, 18);
    const ctx = g.getContext();

    // Circulo pequeno amarillo-verde
    ctx.fillStyle = '#aaff00';
    ctx.beginPath();
    ctx.arc(9, 9, 8, 0, Math.PI * 2);
    ctx.fill();

    // Alas laterales
    ctx.fillStyle = '#88cc00';
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.lineTo(5, 4);
    ctx.lineTo(5, 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18, 9);
    ctx.lineTo(13, 4);
    ctx.lineTo(13, 14);
    ctx.closePath();
    ctx.fill();

    // Ojo
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(9, 9, 2, 0, Math.PI * 2);
    ctx.fill();

    g.refresh();
  }

  generatePowerUpTextures() {
    const types = [
      { key: 'powerup-double',  color: '#ff8800', letter: 'D' },
      { key: 'powerup-triple',  color: '#00ffff', letter: 'T' },
      { key: 'powerup-rapid',   color: '#ffff00', letter: 'R' },
      { key: 'powerup-shield',  color: '#4488ff', letter: 'S' },
      { key: 'powerup-life',    color: '#33ff33', letter: '+' }
    ];

    types.forEach(({ key, color, letter }) => {
      const g = this.textures.createCanvas(key, 20, 20);
      const ctx = g.getContext();

      // Circulo de fondo
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(10, 10, 9, 0, Math.PI * 2);
      ctx.fill();

      // Borde brillante
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Letra
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, 10, 10);

      g.refresh();
    });
  }

  generateBossTexture() {
    const g = this.textures.createCanvas('boss', 64, 64);
    const ctx = g.getContext();

    // Cuerpo principal - hexagono grande
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(32, 2);
    ctx.lineTo(58, 16);
    ctx.lineTo(58, 48);
    ctx.lineTo(32, 62);
    ctx.lineTo(6, 48);
    ctx.lineTo(6, 16);
    ctx.closePath();
    ctx.fill();

    // Capa interior
    ctx.fillStyle = '#880000';
    ctx.beginPath();
    ctx.moveTo(32, 10);
    ctx.lineTo(50, 20);
    ctx.lineTo(50, 44);
    ctx.lineTo(32, 54);
    ctx.lineTo(14, 44);
    ctx.lineTo(14, 20);
    ctx.closePath();
    ctx.fill();

    // Ojo central grande
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(32, 28, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(32, 28, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(32, 28, 2, 0, Math.PI * 2);
    ctx.fill();

    // Canones laterales
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(0, 26, 8, 12);
    ctx.fillRect(56, 26, 8, 12);

    // Boca amenazante
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(22, 42, 20, 3);
    ctx.fillRect(24, 46, 4, 3);
    ctx.fillRect(30, 46, 4, 3);
    ctx.fillRect(36, 46, 4, 3);

    // Borde brillante
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 2);
    ctx.lineTo(58, 16);
    ctx.lineTo(58, 48);
    ctx.lineTo(32, 62);
    ctx.lineTo(6, 48);
    ctx.lineTo(6, 16);
    ctx.closePath();
    ctx.stroke();

    g.refresh();
  }

  generateShieldTexture() {
    const g = this.textures.createCanvas('shield', 44, 44);
    const ctx = g.getContext();

    // Burbuja de escudo
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(22, 22, 20, 0, Math.PI * 2);
    ctx.stroke();

    // Brillo interior
    ctx.strokeStyle = 'rgba(68, 136, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(22, 22, 16, 0, Math.PI * 2);
    ctx.stroke();

    g.refresh();
  }

  generateMenuShip() {
    const W = 140, H = 160;
    const g = this.textures.createCanvas('menu-ship', W, H);
    const ctx = g.getContext();
    ctx.imageSmoothingEnabled = false;

    const cx = W / 2;

    // Dibujar con vectores suaves en vez de pixels individuales
    // Esto evita las escaleras en las diagonales

    // === SOMBRA / GLOW ===
    ctx.shadowColor = 'rgba(0,150,255,0.3)';
    ctx.shadowBlur = 12;

    // === ALAS (detras del cuerpo) ===
    ctx.fillStyle = '#003366';
    ctx.beginPath();
    ctx.moveTo(cx - 8, 50);    // inicio ala izq
    ctx.lineTo(5, 105);         // punta ala izq
    ctx.lineTo(8, 115);         // punta ala izq abajo
    ctx.lineTo(cx - 12, 95);   // vuelta al cuerpo
    ctx.closePath();
    ctx.fill();
    // Ala derecha (espejo)
    ctx.beginPath();
    ctx.moveTo(cx + 8, 50);
    ctx.lineTo(W - 5, 105);
    ctx.lineTo(W - 8, 115);
    ctx.lineTo(cx + 12, 95);
    ctx.closePath();
    ctx.fill();

    // Ala highlights
    ctx.fillStyle = '#005599';
    ctx.beginPath();
    ctx.moveTo(cx - 8, 55);
    ctx.lineTo(12, 100);
    ctx.lineTo(14, 105);
    ctx.lineTo(cx - 10, 88);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 8, 55);
    ctx.lineTo(W - 12, 100);
    ctx.lineTo(W - 14, 105);
    ctx.lineTo(cx + 10, 88);
    ctx.closePath();
    ctx.fill();

    // Linea de panel en las alas
    ctx.strokeStyle = '#0088cc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 10, 60);
    ctx.lineTo(15, 100);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10, 60);
    ctx.lineTo(W - 15, 100);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // === CUERPO PRINCIPAL ===
    ctx.fillStyle = '#0077bb';
    ctx.beginPath();
    ctx.moveTo(cx, 4);          // punta
    ctx.lineTo(cx + 16, 80);    // lado derecho
    ctx.lineTo(cx + 14, 110);   // cola derecha
    ctx.lineTo(cx + 6, 118);    // cola interior der
    ctx.lineTo(cx - 6, 118);    // cola interior izq
    ctx.lineTo(cx - 14, 110);   // cola izquierda
    ctx.lineTo(cx - 16, 80);    // lado izquierdo
    ctx.closePath();
    ctx.fill();

    // Cuerpo highlight centro
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.moveTo(cx, 8);
    ctx.lineTo(cx + 10, 80);
    ctx.lineTo(cx + 8, 108);
    ctx.lineTo(cx, 114);
    ctx.lineTo(cx - 8, 108);
    ctx.lineTo(cx - 10, 80);
    ctx.closePath();
    ctx.fill();

    // Franja brillante central
    ctx.fillStyle = '#33ccff';
    ctx.beginPath();
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx + 4, 75);
    ctx.lineTo(cx + 3, 105);
    ctx.lineTo(cx, 110);
    ctx.lineTo(cx - 3, 105);
    ctx.lineTo(cx - 4, 75);
    ctx.closePath();
    ctx.fill();

    // === COCKPIT ===
    ctx.fillStyle = '#88eeff';
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx + 7, 45);
    ctx.lineTo(cx + 5, 55);
    ctx.lineTo(cx, 50);
    ctx.lineTo(cx - 5, 55);
    ctx.lineTo(cx - 7, 45);
    ctx.closePath();
    ctx.fill();

    // Cockpit brillo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, 22);
    ctx.lineTo(cx + 4, 40);
    ctx.lineTo(cx, 38);
    ctx.lineTo(cx - 4, 40);
    ctx.closePath();
    ctx.fill();

    // Cockpit borde
    ctx.strokeStyle = '#55bbdd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx + 7, 45);
    ctx.lineTo(cx + 5, 55);
    ctx.lineTo(cx, 50);
    ctx.lineTo(cx - 5, 55);
    ctx.lineTo(cx - 7, 45);
    ctx.closePath();
    ctx.stroke();

    // === BORDES DEL CUERPO ===
    ctx.strokeStyle = '#0099dd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx + 16, 80);
    ctx.lineTo(cx + 14, 110);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx - 16, 80);
    ctx.lineTo(cx - 14, 110);
    ctx.stroke();

    // === PUNTA BRILLANTE ===
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#aaeeff';
    ctx.beginPath();
    ctx.arc(cx, 10, 2, 0, Math.PI * 2);
    ctx.fill();

    // === MOTORES ===
    // Motor central
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(cx - 4, 118, 8, 6);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(cx - 3, 120, 6, 5);
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(cx - 2, 124, 4, 8);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(cx - 1, 128, 2, 6);

    // Motor izquierdo
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(8, 112, 5, 4);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(9, 114, 3, 4);
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(9, 117, 3, 5);

    // Motor derecho
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(W - 13, 112, 5, 4);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(W - 12, 114, 3, 4);
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(W - 12, 117, 3, 5);

    // === DETALLES DECORATIVOS ===
    // Puntos de luz en las alas
    ctx.fillStyle = '#00ddff';
    ctx.beginPath(); ctx.arc(25, 95, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - 25, 95, 2, 0, Math.PI * 2); ctx.fill();

    // Lineas de panel en el cuerpo
    ctx.strokeStyle = 'rgba(0,200,255,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx - 12, 65); ctx.lineTo(cx - 10, 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 12, 65); ctx.lineTo(cx + 10, 90); ctx.stroke();

    g.refresh();
  }
}
