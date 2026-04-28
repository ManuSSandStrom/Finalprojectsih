# Smart Classroom Scheduler

A MERN smart classroom management app for courses, faculty, rooms, notifications, AI timetable generation, timetable PDF export, and an AI scheduling assistant.

## Features

- Course, faculty, room, and notification management
- AI-powered timetable generation
- Weekly schedules with optional Saturday/Sunday classes
- One-day special class timetable mode
- Professional PDF export for generated timetables
- Responsive dashboard and management screens for laptop, tablet, and mobile
- Deployment-ready API configuration for Render and Netlify

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- AI: OpenAI-compatible chat completion API
- Deployment: Render for backend, Netlify for frontend

## Project Structure

```text
backend/      Express API, MongoDB models, AI timetable generator
frontend/     React/Vite client
render.yaml   Render service blueprint
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Required backend environment variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_or_openrouter_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend environment:

```env
VITE_API_URL=http://localhost:5000
```

## Render Backend Deployment

1. Create a new Render Web Service from this repository.
2. Use `backend` as the root directory.
3. Build command: `npm install`
4. Start command: `npm start`
5. Health check path: `/api/health`
6. Add environment variables in Render:
   - `MONGO_URI`
   - `CLIENT_URL` set to your Netlify URL, for example `https://your-site.netlify.app`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `OPENAI_BASE_URL` if using a non-default OpenAI-compatible provider

## Netlify Frontend Deployment

1. Create a new Netlify site from this repository.
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`
5. Add environment variable:
   - `VITE_API_URL=https://your-render-backend.onrender.com`

The included `frontend/netlify.toml` handles SPA route refreshes.

## Security

- Real `.env` files are ignored by Git.
- Only `.env.example` placeholder files should be committed.
- Add production secrets only in Render and Netlify dashboards.

## Verification

Recommended checks before deployment:

```bash
cd backend
npm test

cd ../frontend
npm run lint
npm run build
```
