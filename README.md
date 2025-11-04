# Triviadle

A trivia quiz application built with Vue 3, TypeScript, and the Open Trivia Database API.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher) with npm - [Download](https://nodejs.org/)
- **Bun** (v1.0 or higher) - [Installation Instructions](https://bun.sh/docs/installation)

This project uses npm for package management and Bun as the runtime/build tool for best compatibility and performance.

## Setup Instructions

1. Clone repository in desired location 
2. Open a terminal/command prompt in the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

This application requires both a frontend dev server and a backend WebSocket server for multiplayer functionality.

**Start the frontend (Vite dev server):**

```bash
bun run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use - check the terminal output).

**Start the backend server (in a separate terminal):**

```bash
bun server/index.ts
```

The backend WebSocket server runs on port 3000 and handles multiplayer matchmaking and game logic.

### Production Build

To create a production build:

```bash
bun run build
```

To preview the production build locally:

```bash
bun run preview
```

The preview will be available at `http://localhost:4173`

## Project Structure

```
web1Project1/
├── src/
│   ├── views/         # Main view components (Classic, Endless, Multiplayer)
│   ├── components/    # Reusable Vue components
│   ├── composables/   # Vue composables (useSocket, useTimer)
│   ├── router/        # Vue Router configuration
│   ├── utils/         # Utility functions and helpers
│   ├── types/         # TypeScript type definitions
│   ├── App.vue        # Root component
│   ├── main.ts        # Application entry point
│   └── style.css      # Global styles
├── server/
│   ├── index.ts       # WebSocket server entry point
│   ├── matchmaking.ts # Multiplayer matchmaking logic
│   ├── game.ts        # Game room management
│   ├── constants.ts   # Server constants
│   └── types/         # Server-side type definitions
├── index.html         # HTML entry point
├── package.json       # Project dependencies and scripts
├── vite.config.ts     # Vite configuration
└── tailwind.config.ts # Tailwind CSS configuration
```

## Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vue Router** - Official routing library

### Backend
- **Bun** - JavaScript runtime and toolkit
- **Express** - Web server framework
- **Socket.IO** - Real-time bidirectional communication
- **@socket.io/bun-engine** - Bun adapter for Socket.IO

### API
- **Open Trivia Database API** - Free trivia questions database

## Features

### Game Modes
- **Classic Mode** - Traditional trivia quiz with configurable questions
- **Endless Mode** - Continuous trivia challenge
- **Multiplayer Mode** - Real-time head-to-head trivia battles

### Gameplay Features
- Score tracking and history
- Category and difficulty selection
- Real-time answer validation
- 10-second time limit per question (multiplayer)
- Responsive design for mobile and desktop

### Multiplayer Features
- Real-time matchmaking system
- WebSocket-based communication
- Live opponent tracking
- Match acceptance flow
- Automatic room cleanup on disconnect

## Troubleshooting

### Port Already in Use
- **Frontend (5173/4173)**: Vite will automatically try the next available port. Check terminal output for the actual URL.
- **Backend (3000)**: If port 3000 is in use, you'll need to change the port in `server/index.ts` and update the corresponding port in the frontend Socket.IO configuration.

### Dependencies Not Installing
Try clearing the cache and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell, use:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build Errors
If you encounter TypeScript or build errors:
1. Ensure you're using Node.js v18 or higher: `node --version`
2. Ensure Bun is installed: `bun --version`
3. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
4. Make sure all dependencies installed successfully without errors

### Multiplayer Connection Issues
If you experience connection issues with multiplayer mode:
1. Ensure the backend server is running (`bun server/index.ts`)
2. Check that port 3000 is accessible
3. Verify CORS settings allow `http://localhost:5173`
4. Check browser console for WebSocket connection errors

### Note on Package Management
This project uses **npm for installing packages** and **Bun as the runtime** for best compatibility. While Bun can be used as a package manager, npm handles certain postinstall scripts (like esbuild) more reliably on Windows.

## Architecture

### Frontend Architecture
- **Vue 3 Composition API** with `<script setup>` syntax
- **Vue Router** for navigation between game modes
- **Composables** for shared logic (Socket.IO connection, timers)
- **Type-safe** interfaces for game state and player data

### Backend Architecture
- **Express HTTP server** with Socket.IO attached
- **Event-driven** WebSocket communication
- **Room-based** matchmaking system
- **In-memory** game state management
- **Automatic cleanup** on player disconnect

### Key Components
- `src/composables/useSocket.ts` - Socket.IO connection management
- `src/composables/useTimer.ts` - Reusable countdown timer logic
- `server/matchmaking.ts` - Player queue and room creation
- `server/game.ts` - Game session management and scoring

## API Information

This project uses the [Open Trivia Database API](https://opentdb.com/) to fetch trivia questions. No API key is required.