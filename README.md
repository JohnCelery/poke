# Poke Adventure

A fully playable Pokémon-inspired browser RPG built with HTML5 Canvas and vanilla JavaScript. Explore Verdant Plains, battle wild creatures, and level up your partner without installing heavyweight tooling. The project ships ready for GitHub Pages deployment and includes a lightweight development server for local playtesting.

## Features

- **Top-down overworld** with smooth tile-based movement and animated tall grass encounters.
- **Turn-based battle system** featuring standard attacks, energy-based special moves, healing, and the ability to flee.
- **Progression loop** that grants experience, levels, and stat upgrades when you defeat wild creatures.
- **Rest areas** that fully heal your party when you reach the glowing campfire tile.
- **Accessibility minded UI** with semantic markup, ARIA live regions, and keyboard-focused controls.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer for running the optional local development server.

### Installation

```bash
npm install
```

### Local Development

Launch an auto-reloading static server:

```bash
npm run dev
```

Then open <http://localhost:4173> in your browser.

### GitHub Pages Deployment

All assets are plain HTML, CSS, and JavaScript. To deploy on GitHub Pages:

1. Push the repository to GitHub.
2. Enable Pages in the repository settings and point it to the `main` (or `gh-pages`) branch root.
3. The game loads without a build step, so no additional configuration is required.

## Controls

- **Move:** Arrow Keys or WASD
- **Confirm Battle Action:** Space / Enter or click buttons
- **Run:** Select *Run* during battle

## Project Structure

```
├── index.html      # App shell and UI overlays
├── style.css       # Retro-inspired styling
├── game.js         # Game logic, rendering, and battle system
├── package.json    # Development server scripts
└── README.md
```

## License

Released under the [MIT License](LICENSE) unless otherwise noted.
