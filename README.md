# Triviadle

A trivia quiz application built with Vue 3, TypeScript, and the Open Trivia Database API.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher) with npm - [Download](https://nodejs.org/)
- **Bun** (v1.0 or higher) - [Installation Instructions](https://bun.sh/docs/installation)

This project uses npm for package management and Bun as the runtime/build tool for best compatibility and performance.

## Setup Instructions

1. Place project directory in desired location
2. Open a terminal/command prompt in the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
bun run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use - check the terminal output).

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
│   ├── Views/         # Main view components
│   ├── components/    # Reusable Vue components
│   ├── router/        # Vue Router configuration
│   ├── utils/         # Utility functions and helpers
│   ├── types/         # TypeScript type definitions
│   ├── App.vue        # Root component
│   ├── main.ts        # Application entry point
│   └── style.css      # Global styles
├── index.html         # HTML entry point
├── package.json       # Project dependencies and scripts
├── vite.config.ts     # Vite configuration
└── tailwind.config.ts # Tailwind CSS configuration
```

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Typed superset of JavaScript
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS v4** - Utility-first CSS framework
- **Bun** - Fast JavaScript runtime and package manager
- **Open Trivia Database API** - Trivia questions data source

## Features

- Multiple trivia game modes
- Score tracking and history
- Category and difficulty selection
- Real-time answer validation
- Responsive design

## Troubleshooting

### Port Already in Use
If port 5173 (dev) or 4173 (preview) is already in use, Vite will automatically try the next available port. Check the terminal output for the actual URL.

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

### Note on Package Management
This project uses **npm for installing packages** and **Bun as the runtime** for best compatibility. While Bun can be used as a package manager, npm handles certain postinstall scripts (like esbuild) more reliably on Windows.

## API Information

This project uses the [Open Trivia Database API](https://opentdb.com/) to fetch trivia questions. No API key is required.

## Browser Compatibility

This application works best in modern browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled.

---

**Student**: William
**Course**: Web Programming 1
**Institution**: Alfred State College
