# MuseMap Website

An interactive and visually appealing website to display a music artist's discography. Features an interactive spider diagram visualization with zoom, pan, and year-based navigation. Each year displays albums and tracks with embedded YouTube players.

## Features

- 🕸️ **Interactive Spider Diagram**: Navigate through years with an animated, zoomable spider diagram
- 🎵 **Album & Track Display**: Browse albums and play tracks with embedded YouTube players
- 🎨 **Dynamic Visualizations**: Year nodes sized by track count with color-coded glows
- 🔄 **Auto-Playlist**: Continuous playback across albums and years
- 📱 **Responsive Design**: Works on both mobile and desktop devices
- 🎭 **Cover Art Backgrounds**: Album cover art displayed as blurred backgrounds

## Tech Stack

- **React** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **D3.js** for diagram logic
- **Framer Motion** for animations
- **react-zoom-pan-pinch** for interactive zoom/pan
- **react-youtube** for YouTube embeds

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd MuseMap-Website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
├── public/
│   └── resources/          # Album cover art images
├── src/
│   ├── components/
│   │   ├── SpiderDiagram.tsx    # Main spider diagram visualization
│   │   └── YearView.tsx         # Year/album/track detail view
│   ├── data/
│   │   └── discography.ts        # Discography data structure
│   ├── types.ts                  # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
└── package.json
```

## Configuration

### Adding Discography Data

Edit `src/data/discography.ts` to add or modify albums and tracks. The structure supports:
- Multiple albums per year
- Multiple tracks per album
- Album cover art
- Artist names per album
- YouTube video IDs for each track

See `DATA_SETUP_GUIDE.md` for detailed instructions.

### Customizing the Artist

Update the `artistConfig` in `src/data/discography.ts`:
- `name`: Artist name displayed in the center
- `startYear`: First year to display
- `endYear`: Last year to display

## Deployment

### GitHub Pages

1. Update `vite.config.ts` with your repository name:
```typescript
base: '/your-repo-name/'
```

2. Build the project:
```bash
npm run build
```

3. Deploy the `dist` folder to GitHub Pages (via GitHub Actions or manually).

## License

Private project - All rights reserved.

