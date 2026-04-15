<p align="center">
  <img src="https://img.shields.io/badge/Phaser-3.80-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBvbHlnb24gcG9pbnRzPSIxNiwyIDI4LDI4IDE2LDIyIDQsMjgiIGZpbGw9IiMwMGJmZmYiLz48L3N2Zz4=" alt="Phaser">
  <img src="https://img.shields.io/badge/Flask-3.x-green?style=for-the-badge&logo=flask" alt="Flask">
  <img src="https://img.shields.io/badge/SQLite-DB-orange?style=for-the-badge&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT">
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.herokuapp.com?font=Press+Start+2P&size=28&duration=3000&pause=1000&color=00BFFF&center=true&vCenter=true&width=500&lines=SPACE;ASSAULT">
    <img alt="Space Assault" src="https://readme-typing-svg.herokuapp.com?font=Press+Start+2P&size=28&duration=3000&pause=1000&color=00BFFF&center=true&vCenter=true&width=500&lines=SPACE;ASSAULT">
  </picture>
</p>

<p align="center">
  <em>Juego arcade top-down shooter con Phaser 3 - Destruye oleadas de enemigos, enfrenta bosses epicos y compite por el ranking global</em>
</p>

---

## Juego

Controla una nave espacial y sobrevive oleadas de enemigos cada vez mas dificiles. Cada 5 waves aparece un boss con patrones de ataque unicos que escalan con el nivel.

### Caracteristicas

- 6 tipos de enemigos con 10 patrones de movimiento organico
- Bosses cada 5 waves con 10 patrones de ataque que escalan
- 5 power-ups: doble/triple disparo, rapido, escudo, vida extra
- Tus balas destruyen balas enemigas
- Sistema de combo (x1 a x4) por kills rapidos
- Ranking online con Flask + SQLite
- Musica y efectos sintetizados (Web Audio API)
- 100% de assets generados por codigo (sin imagenes externas)
- Responsive con controles touch para movil
- Bot AI para testing automatizado

### Controles

| Tecla | Accion |
|-------|--------|
| `<` `>` / `A` `D` | Mover nave |
| `SPACE` | Disparar |
| `ESC` | Pausar |
| `M` | Musica ON/OFF |

## Instalacion

### Solo frontend (sin ranking)
Abre `index.html` en un navegador o sirve con cualquier server estatico:
```bash
python3 -m http.server 8080
```

### Con backend (ranking online)
```bash
pip install flask
python3 server.py
```
Abre `http://localhost:5000`

## API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/ranking?limit=10` | Top N scores |
| `POST` | `/api/score` | Guardar `{name, score, wave, kills}` |

## Estructura

```
Space-Assault/
├── index.html             # Entrada + fondo estrellas animado
├── server.py              # Flask API + servidor estatico
├── test.html              # Bot AI automatizado
├── css/style.css          # Responsive + fondo espacial
├── js/
│   ├── config.js          # Constantes + panel controles global
│   ├── scenes/
│   │   ├── BootScene.js       # Genera texturas por codigo
│   │   ├── MenuScene.js       # Menu navegable
│   │   ├── GameScene.js       # Loop principal + pausa
│   │   ├── UIScene.js         # HUD overlay
│   │   ├── GameOverScene.js   # Score + input nombre
│   │   └── RankingScene.js    # Top 10
│   ├── entities/
│   │   ├── Player.js          # Nave + power-ups + escudo
│   │   ├── Bullet.js          # Pool balas jugador
│   │   ├── Enemy.js           # 6 tipos + 10 patrones
│   │   ├── EnemyBullet.js     # Pool + limpieza
│   │   ├── Boss.js            # 10 patrones de ataque
│   │   └── PowerUp.js         # 5 tipos
│   └── managers/
│       ├── GameManager.js     # Estado global
│       ├── WaveManager.js     # Oleadas + formaciones
│       ├── ScoreManager.js    # Score + combo
│       ├── AudioManager.js    # SFX + musica
│       └── ParticleManager.js # Explosiones
└── requirements.txt       # flask
```

## Enemigos

| Tipo | Visual | HP | Habilidad |
|------|--------|----|-----------|
| Basic | Cuadrado verde | 1 | Movimiento organico |
| Fast | Triangulo rojo | 1 | Kamikaze, dive, flanker |
| Tank | Hexagono morado | 3 | Lento pero resistente |
| Swarm | Circulo verde | 1 | Rapido en grupo |
| Sniper | Rectangulo azul | 1 | Se detiene y dispara dirigido |
| Splitter | Diamante naranja | 2 | Se divide en 2 Swarm al morir |

## Bosses

Aparecen cada 5 waves. Cada boss tiene nombre, color unico, HP escalable y patrones de ataque progresivos:

| Wave | Boss | Patrones disponibles |
|------|------|---------------------|
| 5 | GUARDIAN | spread, aimed, barrage |
| 10 | OVERLORD | + wall, spiral |
| 15 | DESTROYER | + shotgun, cross |
| 20 | NEMESIS | + rain, helix |
| 25+ | TITAN/COLOSSUS | + cage (todos) |

Al 50% de vida entran en **Fase 2**: ataques dobles y mas rapidos.

## Tech

- **Phaser 3.80.1** - Motor de juego (CDN)
- **Flask** - Backend API REST
- **SQLite** - Base de datos de scores
- **Web Audio API** - Sonidos y musica sintetizados
- **Canvas API** - Generacion de sprites y texturas
- **Google Fonts** - Press Start 2P + Exo 2

## Licencia

[MIT](LICENSE)
