# 🌌 Astraeus — Interactive Stellar Visualization System

**Astraeus** is an interactive 3D web application for exploring the cosmos.  
It visualizes real astronomical data from the HYG star catalog using **Three.js**, **React Three Fiber**, and **Framer Motion**.  
Each star is rendered in real-time based on its spectral type, magnitude, and distance — creating a scientifically grounded yet cinematic experience.

---

## ✨ Overview

Astraeus bridges the gap between **data analysis** and **astronomical visualization**.  
Users can explore star clusters, view constellation structures, analyze spectral data, and learn contextual facts about individual stars — all within a smooth, dynamic 3D interface.

---

## 🧠 Core Features

### 🪐 Real-Time 3D Starfield
- Built with **React Three Fiber** and **custom GPU shaders** for realistic twinkling and colour gradation.  
- Each star’s brightness and hue correspond to its **spectral classification (OBAFGKMLTY)**.  
- Click any star to bring up detailed metadata and fun contextual facts.

### 🌟 Star Analytics (Research Module)
The **StarAnalytics** component performs statistical and visual analysis on the HYG dataset, powering quantitative exploration:
- Calculates **average**, **median**, and **distribution** values for magnitude, luminosity, and distance.  
- Identifies **brightest**, **nearest**, and **most luminous** stars dynamically.  
- Generates a **spectral type distribution chart** using *Recharts*, with live tooltips and percentage labels.  
- Provides concise **fact summaries** and **dataset insights** (dominant spectral class, stellar density, temperature ranges).  
- Designed as a research-focused submodule in the Astraeus system.

### 🧭 Constellation Viewer
- Highlights constellations dynamically when a star is selected.  
- Uses coordinate-linked data from a JSON mapping (`constellationLines.json`).  
- Provides structural context within the galactic dataset.

### 📚 Star Guide Panel
- A searchable, scrollable list of all parsed stars.  
- Displays name, constellation, and classification in an elegant glassmorphic sidebar.  
- Integrated theme toggle for day/night switching.

### 🌠 Star Info Card
- Expands with animation (Framer Motion) when a star is selected.  
- Displays detailed data (name, magnitude, distance, spectral type, and a dynamically generated fun fact).  

### 🌅 Star of the Day
- Highlights a random, notable star with a daily factoid to add user engagement.

### 🎨 Spectral Legend
- Displays the colour-temperature mapping for all spectral types for quick scientific reference.

### 🎬 Cinematic Intro
- Animated introduction using Framer Motion for smooth onboarding transitions and ambience.

---

## 🧩 Project Architecture

```bash
src/
├── analytics/
│ ├── SpectralLegend.jsx # Colour-temperature legend for spectral types
│ └── StarAnalytics.jsx # Statistical + visual data analysis module
├── core/
│ ├── AppLayout.jsx # Root layout, orchestrates all modules
│ ├── FlyToStar.jsx # Camera transition system for star focus
│ ├── StarCanvas.jsx # Three.js canvas wrapper
│ ├── useDeepSkyObjects.jsx # (Planned) Nebula/deep-sky data hook
│ └── useStars.jsx # Core star data loader & mapping logic
├── features/
│ ├── BackgroundMilkyway.jsx # (Planned) Background Milky Way panorama
│ ├── CinematicIntro.jsx # Animated intro & onboarding
│ ├── ClickHandler.jsx # Handles click/raycast events
│ ├── ConstellationViewer.jsx # Draws constellation line connections
│ ├── DeepSkyField.jsx # (Planned) Future nebula or DSO handler
│ ├── StarField.jsx # Main GPU-rendered 3D starfield
│ ├── StarGuide.jsx # Sidebar UI for browsing/searching stars
│ └── StarOfTheDay.jsx # Random daily featured star generator
├── ui/
│ ├── LoadingOverlay.jsx # Animated loading spinner + intro fade
│ └── StarInfoCard.jsx # Displays detailed star info + facts
├── App.css # Global styles
├── App.jsx # Entry point linking layout + routes
├── constellationLines.json # Constellation mapping data (HIP IDs)
├── ErrorBoundary.jsx # Fallback component for runtime errors
├── index.css # Base style resets
└── main.jsx # Application bootstrap
```

---

## 🧮 Data Source

**HYG Star Database v4.2**  
The dataset includes:
- Hipparcos, Yale, and Gliese cross-referenced star data  
- 119,000+ stars  
- Parameters: magnitude, distance, luminosity, spectral type, and coordinates (x, y, z)

CSV parsing handled via [`papaparse`](https://www.papaparse.com/).

---

## 🧰 Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | **React (Vite)** |
| 3D Engine | **Three.js + React Three Fiber** |
| Animation | **Framer Motion** |
| Charts | **Recharts** |
| Data Parsing | **PapaParse** |
| UI Styling | **Inline Glassmorphism + Custom Fonts (Iceland, Nova Square, Playwrite US Modern)** |
| Deployment | **Vercel** |

---

## 🚀 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/RustedIronn/astraeus.git
cd astraeus

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
