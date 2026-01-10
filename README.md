# Pokémon Card Collection & Trading

A simple full-stack app to manage and trade Pokémon cards.

## Features
- Username-only login (no password)
- Add cards via image upload; auto name guess
- Total collection value
- Public share links
- Trade offers with accept/decline
- TailwindCSS yellow playful theme

## Stack
- Frontend: React (Vite), TailwindCSS
- Backend: Node.js + Express, Multer, local JSON files

## Setup

### 1) Install dependencies

```powershell
# From project root
Push-Location "c:\Users\23021210\Documents\Pokemon trading"
# Server deps
Push-Location .\server; npm install; Pop-Location
# Client deps
Push-Location .\client; npm install; Pop-Location
Pop-Location
```

### 2) Run dev

```powershell
# Start backend
Push-Location "c:\Users\23021210\Documents\Pokemon trading\server"; npm run start; Pop-Location
# Start frontend (in a new terminal)
Push-Location "c:\Users\23021210\Documents\Pokemon trading\client"; npm run dev; Pop-Location
```

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## Notes
- Images are stored under `server/uploads/<username>` and served at `/uploads/...`.
- User data JSON files are under `server/data/users/<username>.json`.
- OCR/name detection is a simple heuristic; upgrade by integrating `tesseract.js` or a cloud OCR.
