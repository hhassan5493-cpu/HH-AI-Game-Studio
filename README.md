# HH AI Game Studio

The initials HH stand for Hassan Hassan.

## Features in this starter
- Prompt-based AI game design plan generation
- Separate AI tools for world, character, mission and mechanics design
- AI-assisted starter browser-game code generation
- Save prompt/result in browser local storage
- Download AI results as JSON
- Mobile-friendly dashboard

## Important limitations
This is a real AI-connected web app scaffold, not a complete automatic 3D game engine. AI responses generate design plans and may generate small prototype code. It does not yet automatically create production-ready 3D human models, rigging, animations, a complete FPS game, multiplayer servers or APK/PC installers.

To achieve those features, integrate a 3D engine (for example Godot or Unity), licensed 3D asset generation/import tools, a multiplayer backend, and Android/PC build pipelines. Each service may have separate pricing and limits.

## Run locally or on Replit
Requires Node.js 18+.

1. Extract this ZIP.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `OPENAI_API_KEY` in `.env` (or as a private Replit Secret).
5. Set `AI_MODEL` to a model available to your API account if needed.
6. Run `npm start`.
7. Open the provided web preview or `http://localhost:3000`.

Do not put API keys in `public/app.js`, HTML, or CSS. Keep secrets on the server. API usage can cost money; it is not unlimited-free.
