# Smart Civic Portal (Backend MVP)

This repository contains the backend API for the Smart Civic Issue Portal MVP, powered by Node.js, Express, and MongoDB.

## Getting Started

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```
2. **Configure environment variables** by creating a `.env` file in `server/` with keys such as:
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `EMAIL_SERVICE`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `CLIENT_BASE_URL`
3. **Start the development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` – start the API with nodemon.
- `npm start` – start the API with Node.

## Folder Overview

- `server/server.js` – Express app setup and middleware.
- `server/config/` – database and multer configuration.
- `server/models/` – Mongoose schemas for `User` and `Complaint`.
- `server/controllers/` – business logic for auth and complaints.
- `server/routes/` – API route definitions.
- `server/utils/` – helper utilities (email notifications).

Frontend scaffolding will be added later; this MVP currently focuses on backend services only.

