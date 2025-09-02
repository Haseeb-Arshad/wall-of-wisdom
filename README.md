# WisdomWall — Sticky-wall flashcards with AI + SRS

This app implements an MVP of a sticky-note study wall with physics, AI-powered card generation, and an SM-2 study player.

Highlights

- Sticky-wall UI with inertia, tilt, and stacking
- Import URL/text → OpenAI generates 5–10 flashcards
- Study session player with Again/Hard/Good/Easy and SM-2 scheduling
- Local-first via IndexedDB; PWA for offline sessions
- Optional Supabase auth (email/password + Google)

Quick Start

```bash
npm install
npm run dev
```

Environment

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` to enable AI generation. Supabase is optional:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Primary Screens

- Home: onboarding CTA to Import/Wall
- Wall: physics-based sticky notes
- Import: URL/Text → AI JSON → deck + cards in IndexedDB
- Study: 5-minute player, reveal + ratings, SM-2 scheduling
- Progress: simple analytics (session length, cards/day, recall%)
- Auth: Supabase stubs; Privacy page explains storage

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

Custom CSS lives in `app/styles/custom.css` and is imported in `app/root.tsx`, following a Next-style CSS import pattern. Tailwind remains installed but is not required for core UI.

---

Built with ❤️ using React Router.
