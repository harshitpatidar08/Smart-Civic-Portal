# Smart Civic Portal — Frontend

React + Vite interface for the Smart Civic Issue Portal blueprint. The UI covers citizen reporting, complaint tracking, and the admin dashboard with Leaflet maps visualization.

## Getting Started

```bash
cd client
npm install
npm run dev
```

### Required Environment Variables

Create `client/.env` (ignored by git) with:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

**Note:** No API key required! Leaflet uses OpenStreetMap tiles which are free and open-source.

## Key Folders

- `src/components` – shared UI (header, map, complaint cards)
- `src/pages` – route-level screens (Home, Login, Admin, etc.)
- `src/context` – `AuthContext` with JWT/session helpers
- `src/services` – Axios instance + API wrappers

Tailwind CSS powers styling (`tailwind.config.js`). Notifications use `react-hot-toast` and maps run via `react-leaflet` with OpenStreetMap tiles.
