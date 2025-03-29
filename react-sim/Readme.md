# React Three.js Globe Flight Simulator

A basic 3D flight simulator featuring a controllable airplane orbiting the Earth, with the Sun and Moon, built using React, TypeScript, Three.js, and @react-three/fiber.

## Features

- 3D Earth globe using `three-globe`.
- Sun and Moon celestial bodies with basic lighting.
- Earth orbits the Sun (can be toggled).
- Moon orbits the Earth (tidally locked).
- Placeholder airplane controllable with keyboard.
- Variable airplane speed control.
- Toggleable camera views (external chase cam and cockpit view).
- On-screen display for flight information (position, altitude, speed, heading) and controls.
- Basic starfield background.
- Airplane location indicator visible from a distance.

## Setup and Installation

**Clone or Download:** Get the project files onto your local machine.

**Navigate to Project Directory:**

```bash
cd flight-sim-react
```

**Install Dependencies:** Requires Node.js and pnpm.

```bash
pnpm install three @types/three @react-three/fiber @react-three/drei three-globe
```

(If you didn't run `pnpm install` after `pnpm create vite`, you might need to run `pnpm install` first to get React dependencies).

## Running the Development Server

```bash
pnpm dev
```

This will start the Vite development server, typically available at <http://localhost:5173>. Open this URL in your web browser.

Controls
Mouse: Click and drag to rotate the view (external camera). Scroll wheel to zoom.

[ArrowUp]: Move Airplane Forward

[ArrowDown]: Move Airplane Backward (slower)

[ArrowLeft]: Yaw Airplane Left

[ArrowRight]: Yaw Airplane Right

[W]: Increase Target Speed

[S]: Decrease Target Speed

[C]: Toggle Camera (External / Cockpit)

[P]: Pause / Play Earth's Orbit around the Sun

Project Structure (Key Files/Folders)

public/: Static assets (textures, models).

src/: Main application source code.

components/: React components for different parts of the simulation (Airplane, EarthGlobe, InfoPanel, etc.).

context/: React Context for managing shared flight state.

hooks/: Custom React hooks (e.g., useKeyboardControls).

types/: TypeScript type definitions.

constants.ts: Shared constants (speeds, sizes, initial values).

App.tsx: Main application component, sets up providers and layout.

main.tsx: Application entry point.

style.css: Global CSS styles.

Next Steps / TODO

[] Load a realistic 3D airplane model (.glb/.gltf) instead of the placeholder cone.
[] Implement pitch controls for the airplane.
[] Add altitude control.
[] Use higher-resolution textures for Earth (day/night), clouds.
[] Implement atmospheric scattering for more realistic visuals.
[] Refine flight physics.
[] Add more celestial bodies or features (cities, landmarks).
