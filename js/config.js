const CONFIG = {
  // Canvas
  WIDTH: 480,
  HEIGHT: 720,

  // Player
  PLAYER_SPEED: 300,
  PLAYER_LIVES: 5,
  PLAYER_INVINCIBLE_TIME: 1500,

  // Bullets
  BULLET_SPEED: 400,
  BULLET_COOLDOWN: 250,
  BULLET_POOL_SIZE: 30,

  // Enemy Bullets
  ENEMY_BULLET_SPEED: 200,
  ENEMY_BULLET_POOL_SIZE: 60,

  // Enemies
  ENEMY_POOL_SIZE: 50,
  ENEMY_TYPES: {
    BASIC:    { key: 'enemy-basic',    hp: 1, speed: 100, score: 10, shootChance: 0.003 },
    FAST:     { key: 'enemy-fast',     hp: 1, speed: 180, score: 20, shootChance: 0.005 },
    TANK:     { key: 'enemy-tank',     hp: 3, speed: 70,  score: 50, shootChance: 0.004 },
    SPLITTER: { key: 'enemy-splitter', hp: 2, speed: 90,  score: 35, shootChance: 0.002 },
    SNIPER:   { key: 'enemy-sniper',   hp: 1, speed: 50,  score: 30, shootChance: 0.008 },
    SWARM:    { key: 'enemy-swarm',    hp: 1, speed: 200, score: 15, shootChance: 0.001 }
  },

  // Waves
  WAVE_PAUSE: 1500,
  WAVE_BASE_ENEMIES: 8,
  WAVE_ENEMY_INCREMENT: 4,
  WAVE_SPEED_SCALE: 1.15,
  BOSS_EVERY: 5,

  // Power-ups
  POWERUP_DROP_CHANCE: 0.15,
  POWERUP_FALL_SPEED: 80,
  POWERUP_DURATION: {
    DOUBLE_SHOT: 8000,
    TRIPLE_SHOT: 8000,
    RAPID_FIRE: 6000,
    SHIELD: 10000
  },

  // Parallax
  STAR_LAYERS: [
    { count: 40, speed: 20, alpha: 0.3 },
    { count: 25, speed: 50, alpha: 0.6 },
    { count: 15, speed: 100, alpha: 1.0 }
  ],

  // Audio
  AUDIO_ENABLED: true,

  // Fonts
  FONT_TITLE: '"Press Start 2P", monospace',
  FONT_UI: '"Exo 2", sans-serif',

  // Storage
  STORAGE_KEY: 'spaceassault_highscore',

  // Game States
  STATES: {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
  }
};

// Panel de controles reutilizable (Menu + Pausa)
function buildControlsPanel(scene, onClose, depth) {
  const d = depth || 60;
  const cx = CONFIG.WIDTH / 2;
  const cy = CONFIG.HEIGHT / 2;
  const els = [];

  // Overlay
  els.push(scene.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x000011, 0.92).setDepth(d));

  // Panel
  els.push(scene.add.rectangle(cx, cy, 360, 460, 0x080818, 0.98).setStrokeStyle(2, 0x00aaff).setDepth(d + 1));

  // Titulo
  els.push(scene.add.text(cx, cy - 205, 'CONTROLES', {
    fontFamily: CONFIG.FONT_TITLE, fontSize: '13px', color: '#00ddff'
  }).setOrigin(0.5).setDepth(d + 2));
  els.push(scene.add.rectangle(cx, cy - 188, 320, 1, 0x1a3050).setDepth(d + 2));

  // Datos
  const rows = [
    { type: 'header', text: 'MOVIMIENTO', color: '#00bbff' },
    { type: 'key', keys: ['\u2190','\u2192'], desc: 'Mover nave' },
    { type: 'key', keys: ['A','D'], desc: 'Alternativo' },
    { type: 'header', text: 'COMBATE', color: '#ff8844' },
    { type: 'key', keys: ['SPACE'], desc: 'Disparar' },
    { type: 'header', text: 'SISTEMA', color: '#88aacc' },
    { type: 'key', keys: ['ESC'], desc: 'Pausar' },
    { type: 'key', keys: ['M'], desc: 'Musica ON/OFF' },
    { type: 'header', text: 'POWER-UPS', color: '#44ff88' },
    { type: 'dot', color: '#ff8800', desc: 'Doble disparo (8s)' },
    { type: 'dot', color: '#00ffff', desc: 'Triple disparo (8s)' },
    { type: 'dot', color: '#ffff00', desc: 'Rapido (6s)' },
    { type: 'dot', color: '#4488ff', desc: 'Escudo 1 golpe (10s)' },
    { type: 'dot', color: '#33ff33', desc: 'Vida extra' }
  ];

  let y = cy - 170;
  const left = cx - 155;

  rows.forEach(row => {
    if (row.type === 'header') {
      y += 4;
      els.push(scene.add.text(left, y, row.text, {
        fontFamily: CONFIG.FONT_UI, fontSize: '10px', color: row.color, fontStyle: '700'
      }).setDepth(d + 2));
      y += 20;
    } else if (row.type === 'key') {
      let kx = left;
      row.keys.forEach(key => {
        const w = Math.max(26, key.length * 9 + 12);
        els.push(scene.add.rectangle(kx + w / 2, y, w, 20, 0x121225).setStrokeStyle(1, 0x334466).setDepth(d + 2));
        els.push(scene.add.text(kx + w / 2, y, key, {
          fontFamily: CONFIG.FONT_UI, fontSize: '11px', color: '#ccddee'
        }).setOrigin(0.5).setDepth(d + 2));
        kx += w + 4;
      });
      els.push(scene.add.text(left + 110, y, row.desc, {
        fontFamily: CONFIG.FONT_UI, fontSize: '11px', color: '#8899aa'
      }).setOrigin(0, 0.5).setDepth(d + 2));
      y += 24;
    } else if (row.type === 'dot') {
      els.push(scene.add.circle(left + 8, y, 5, Phaser.Display.Color.HexStringToColor(row.color).color).setDepth(d + 2));
      els.push(scene.add.text(left + 22, y, row.desc, {
        fontFamily: CONFIG.FONT_UI, fontSize: '11px', color: '#8899aa'
      }).setOrigin(0, 0.5).setDepth(d + 2));
      y += 22;
    }
  });

  // Linea inferior
  els.push(scene.add.rectangle(cx, cy + 198, 320, 1, 0x1a3050).setDepth(d + 2));

  // Boton cerrar
  const closeBtn = scene.add.rectangle(cx, cy + 218, 160, 28, 0x0a0a18, 0.8)
    .setStrokeStyle(1, 0x00aaff).setDepth(d + 2)
    .setInteractive({ useHandCursor: true });
  els.push(closeBtn);
  els.push(scene.add.text(cx, cy + 218, 'CERRAR', {
    fontFamily: CONFIG.FONT_UI, fontSize: '12px', color: '#00ddff'
  }).setOrigin(0.5).setDepth(d + 2));

  closeBtn.on('pointerover', () => closeBtn.setStrokeStyle(2, 0x00ffaa));
  closeBtn.on('pointerout', () => closeBtn.setStrokeStyle(1, 0x00aaff));
  closeBtn.on('pointerdown', () => { if (onClose) onClose(); });

  return els;
}
