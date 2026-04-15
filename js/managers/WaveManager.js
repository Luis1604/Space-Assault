class WaveManager {
  constructor() {
    this.currentWave = 0;
    this.enemiesRemaining = 0;
    this.enemiesSpawned = 0;
    this.enemiesToSpawn = 0;
    this.isSpawning = false;
    this.waveActive = false;
    this.spawnTimer = null;
    this.speedMultiplier = 1;
  }

  reset() {
    this.currentWave = 0;
    this.enemiesRemaining = 0;
    this.enemiesSpawned = 0;
    this.enemiesToSpawn = 0;
    this.isSpawning = false;
    this.waveActive = false;
    this.speedMultiplier = 1;
  }

  startNextWave(scene, enemyPool) {
    this.currentWave++;
    // Escalado mas agresivo: 15% mas rapido por wave
    this.speedMultiplier = 1 + (this.currentWave - 1) * 0.15;

    // Mas enemigos por wave: 8 base + 4 por wave
    const totalEnemies = Math.min(
      CONFIG.ENEMY_POOL_SIZE - 5,
      8 + (this.currentWave - 1) * 4
    );

    this.enemiesToSpawn = totalEnemies;
    this.enemiesSpawned = 0;
    this.enemiesRemaining = totalEnemies;
    this.waveActive = true;
    this.isSpawning = true;

    // Composicion de enemigos segun wave
    this.waveComposition = this._getWaveComposition(totalEnemies);

    scene.events.emit('wave-started', this.currentWave);

    // Patron de spawn segun wave
    const formation = this._pickFormation();
    const positions = this._generateFormation(formation, totalEnemies);

    // Spawn con delay reducido (150ms base, baja con waves)
    const spawnDelay = Math.max(80, 200 - this.currentWave * 15);
    let spawnIndex = 0;

    this.spawnTimer = scene.time.addEvent({
      delay: spawnDelay,
      repeat: totalEnemies - 1,
      callback: () => {
        if (spawnIndex < this.waveComposition.length) {
          const type = this.waveComposition[spawnIndex];
          const pos = positions[spawnIndex];
          enemyPool.spawn(pos.x, pos.y, type, this.speedMultiplier);
          this.enemiesSpawned++;
          spawnIndex++;
        }
        if (spawnIndex >= this.waveComposition.length) {
          this.isSpawning = false;
        }
      }
    });
  }

  _pickFormation() {
    const formations = ['random', 'v_shape', 'grid', 'sides', 'cascade', 'circle_top'];
    // Waves tempranas = formaciones simples, despues mezcla
    if (this.currentWave <= 2) {
      return ['random', 'grid', 'cascade'][Math.floor(Math.random() * 3)];
    }
    return formations[Math.floor(Math.random() * formations.length)];
  }

  _generateFormation(formation, count) {
    const positions = [];
    const margin = 40;
    const w = CONFIG.WIDTH - margin * 2;

    switch (formation) {
      case 'grid': {
        const cols = Math.min(count, 6);
        const rows = Math.ceil(count / cols);
        const cellW = w / cols;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols && positions.length < count; c++) {
            positions.push({
              x: margin + cellW * c + cellW / 2,
              y: -30 - r * 40
            });
          }
        }
        break;
      }

      case 'v_shape': {
        const half = Math.ceil(count / 2);
        const cx = CONFIG.WIDTH / 2;
        for (let i = 0; i < count; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const row = Math.floor(i / 2);
          positions.push({
            x: cx + side * (row * 40 + 20),
            y: -30 - row * 35
          });
        }
        break;
      }

      case 'sides': {
        for (let i = 0; i < count; i++) {
          const side = i % 2 === 0;
          positions.push({
            x: side ? Phaser.Math.Between(margin, margin + 80) : Phaser.Math.Between(CONFIG.WIDTH - margin - 80, CONFIG.WIDTH - margin),
            y: -20 - Math.floor(i / 2) * 30
          });
        }
        break;
      }

      case 'cascade': {
        for (let i = 0; i < count; i++) {
          positions.push({
            x: margin + (i % 7) * (w / 7) + (w / 14),
            y: -20 - i * 25
          });
        }
        break;
      }

      case 'circle_top': {
        const cx = CONFIG.WIDTH / 2;
        const radius = 100;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
          positions.push({
            x: cx + Math.cos(angle) * radius,
            y: -60 + Math.sin(angle) * 50 - 30
          });
        }
        break;
      }

      default: { // random
        for (let i = 0; i < count; i++) {
          positions.push({
            x: Phaser.Math.Between(margin, CONFIG.WIDTH - margin),
            y: Phaser.Math.Between(-120, -20)
          });
        }
        break;
      }
    }

    return positions;
  }

  _getWaveComposition(total) {
    const composition = [];
    const wave = this.currentWave;

    if (wave === 1) {
      // Wave 1: solo basicos
      for (let i = 0; i < total; i++) composition.push('BASIC');
    } else if (wave === 2) {
      // Wave 2: basicos + rapidos
      const fast = Math.floor(total * 0.3);
      for (let i = 0; i < total - fast; i++) composition.push('BASIC');
      for (let i = 0; i < fast; i++) composition.push('FAST');
    } else if (wave === 3) {
      // Wave 3: introduccion de tanques y swarm
      const tanks = Math.max(1, Math.floor(total * 0.1));
      const fast = Math.floor(total * 0.25);
      const swarm = Math.floor(total * 0.15);
      const basic = total - tanks - fast - swarm;
      this._fill(composition, 'BASIC', basic);
      this._fill(composition, 'FAST', fast);
      this._fill(composition, 'TANK', tanks);
      this._fill(composition, 'SWARM', swarm);
    } else if (wave === 4) {
      // Wave 4: introduccion de snipers
      const tanks = Math.floor(total * 0.1);
      const fast = Math.floor(total * 0.2);
      const swarm = Math.floor(total * 0.15);
      const snipers = Math.max(1, Math.floor(total * 0.1));
      const basic = total - tanks - fast - swarm - snipers;
      this._fill(composition, 'BASIC', basic);
      this._fill(composition, 'FAST', fast);
      this._fill(composition, 'TANK', tanks);
      this._fill(composition, 'SWARM', swarm);
      this._fill(composition, 'SNIPER', snipers);
    } else {
      // Wave 5+: todos los tipos, escalado agresivo
      const splitters = Math.max(1, Math.floor(total * 0.1));
      const snipers = Math.max(1, Math.floor(total * 0.1));
      const swarm = Math.floor(total * 0.15);
      const tanks = Math.floor(total * 0.15);
      const fast = Math.floor(total * 0.25);
      const basic = total - tanks - fast - splitters - snipers - swarm;
      this._fill(composition, 'BASIC', Math.max(0, basic));
      this._fill(composition, 'FAST', fast);
      this._fill(composition, 'TANK', tanks);
      this._fill(composition, 'SPLITTER', splitters);
      this._fill(composition, 'SNIPER', snipers);
      this._fill(composition, 'SWARM', swarm);
    }

    // Mezclar orden
    return composition.sort(() => Math.random() - 0.5);
  }

  _fill(arr, type, count) {
    for (let i = 0; i < count; i++) arr.push(type);
  }

  onEnemyDestroyed() {
    if (this.enemiesRemaining > 0) {
      this.enemiesRemaining--;
    }
  }

  isWaveComplete() {
    return this.waveActive && !this.isSpawning && this.enemiesRemaining <= 0;
  }

  cleanup(scene) {
    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
      this.spawnTimer = null;
    }
  }
}
