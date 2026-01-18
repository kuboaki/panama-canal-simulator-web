# Panama Canal Lock Simulator

An interactive web simulator for experiencing the Panama Canal lock system. Learn about water level changes, ship displacement effects, and gate pressure through hands-on operation of valves, gates, and ships.

![Panama Canal Lock Simulator - Lock Chamber View](images/screenshot01.png)

**[日本語版 README はこちら](README_ja.md)**

## Live Demo

**🚀 [Try the simulator here](https://kuboaki.github.io/panama-canal-simulator-web/)**

## Overview

<img src="images/screenshot02.png" width="300" alt="シミュレーター全体画面">


## Key Features

- **Real-time Simulation**: Adjust water levels by operating valves and gates
- **Time Scale Control**: Adjustable from 1x to 100x speed
- **Ship Displacement Effects**: Visualize how ship displacement and horizontal area affect water levels
- **Physics Calculations**: Calculate and display gate pressure and load based on water level differences
- **Visual Feedback**: Real-time status display with cross-sectional view of the lock chamber

## Tech Stack

- React 18
- Tailwind CSS (CDN)
- Lucide React (icons)

## Running Locally

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/kuboaki/panama-canal-simulator-web.git
cd panama-canal-simulator-web

# Install dependencies
npm install

# Start development server
npm start
```

Open `http://localhost:3000` in your browser.

### Build

```bash
# Build for production
npm run build
```

Built files will be output to the `build/` folder.

### Deploy to GitHub Pages

```bash
# Deploy to GitHub Pages
npm run deploy
```

## How to Use

### Basic Operations

1. **Start Simulation**: Click the "開始" (Start) button
2. **Valve Operation**: Adjust valve opening with sliders (0-100%)
3. **Gate Operation**: Open/close gates with buttons
4. **Ship Movement**: Move ships with buttons when gates are open

### Typical Operation Flow

1. Start with the ship in the upper stream
2. Open the upper gate and move the ship into the chamber
3. Close the upper gate
4. Adjust chamber water level to match lower stream (10m) using lower valve
5. Open lower gate when water levels are equal (load becomes zero)
6. Move ship to lower stream

### Important Concepts

**Ship Displacement and Water Levels**

When a ship is in the lock chamber, pay attention to how water levels appear:

- **Base Water Level**: Height of water only
- **Display Water Level**: Height including rise from ship displacement
- **Gate Opening Condition**: Display water level must equal adjacent water area

Example: For a ship with 70,000m³ displacement and 6,000m² horizontal area
- Water level rise from ship: approximately 2.1m
- To match lower stream (10m), base water level should be approximately 7.9m

## Project Structure

```
panama-canal-simulator-web/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main component
│   ├── index.js        # Entry point
│   └── index.css       # Styles
├── package.json
├── README.md
├── README_ja.md
└── .gitignore
```

## License

MIT License

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Author

- Shin Kuboaki (久保秋 真) - [GitHub Profile](https://github.com/kuboaki)

## Acknowledgments

- Created for educational purposes about Panama Canal operations
- Physics simulation is simplified for demonstration purposes
