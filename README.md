# Felix Flight Simulator

Felix Flight Simulator / 云端飞行模拟器 is a lightweight browser-based civil flight simulator built with Next.js, TypeScript, Tailwind CSS, and React Three Fiber.

Players can choose aircraft, airports, and missions, then fly a simplified but believable takeoff, cruise, and landing experience directly in the browser. The simulator includes a 3D runway scene, HUD instruments, keyboard controls, mobile touch controls, simplified lift and stall physics, mission scoring, local flight logs, and leaderboard records.

## Features

- Playable `/play` flight simulator with 3D runway, airport scenery, terrain, clouds, and aircraft models
- Three aircraft: Cessna 172, Business Jet, and A320-like Airliner
- Three airports with runway, wind, visibility, and difficulty data
- Four mission types: takeoff training, landing training, free flight, and route challenge
- HUD with airspeed, altitude, heading, vertical speed, throttle, flaps, gear, warnings, and mission status
- PC controls via keyboard and desktop mouse throttle buttons
- Mobile controls with virtual yoke, throttle slider, brake, flaps, gear, view, and pause buttons
- LocalStorage flight records and leaderboard
- Responsive aviation-themed UI for desktop and mobile

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- React Three Fiber / Three.js
- localStorage mock persistence

## Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000` or the port printed by Next.js.

## Build

```bash
npm run build
```

The project uses the official Next.js WASM SWC package and Webpack build mode for compatibility with this local macOS environment.
