# AI-Powered Community Resource Finder

Production-ready SaaS architecture for an All-India community resource discovery assistant.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, REST API
- AI layer: OpenAI Responses API with prompt and response processing services
- Database: MongoDB Atlas with JSON fallback for local development
- Data: `data/resources.json`

## Folder Structure

```txt
/client
  /src
    /api
    /components
/server
  /config
  /controllers
  /middleware
  /models
  /routes
  /services
  server.js
/data
  resources.json
```

## API

- `POST /api/chat` - detects intent, matches local resources, generates an AI answer, stores session history
- `GET /api/resources` - returns filtered resources
- `GET /api/history` - returns chat history for the current session
- `POST /api/history` - appends chat messages
- `POST /api/auth/register` - optional basic user registration
- `POST /api/auth/login` - optional basic login

## What You Need To Add

### 1. Server Environment

Create this file:

```txt
server/.env
```

Add:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
MONGODB_URI=your_mongodb_atlas_connection_string_here
PORT=8080
CLIENT_ORIGIN=http://localhost:5173
```

Required for full AI behavior:

- `OPENAI_API_KEY`: create this from the OpenAI API dashboard.
- `MONGODB_URI`: create this from MongoDB Atlas. The app still runs without it, but chat history will only be stored in memory.

### 2. Client Environment

Create this file:

```txt
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:8080
```

For deployment, change it to your Render backend URL.

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files on PowerShell:

```powershell
Copy-Item .env.example server/.env
Copy-Item client/.env.example client/.env
```

3. Edit `server/.env` and replace the placeholder values:

```env
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-4o-mini
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/community-finder
PORT=8080
CLIENT_ORIGIN=http://localhost:5173
```

If `MONGODB_URI` is omitted, the API uses `data/resources.json` and in-memory chat history.

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8080`

## Quick Verification

Backend health:

```powershell
Invoke-RestMethod http://localhost:8080/health
```

Expected result:

```json
{
  "ok": true,
  "service": "community-resource-finder-api"
}
```

Test chat endpoint:

```powershell
Invoke-RestMethod http://localhost:8080/api/chat `
  -Method Post `
  -ContentType "application/json" `
  -Headers @{"x-session-id"="local-test"} `
  -Body '{"message":"nearest emergency hospital near LPU","city":"All"}'
```

## Deployment

### Vercel Frontend

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-render-api.onrender.com`

### Render Backend

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `OPENAI_API_KEY`, `OPENAI_MODEL`, `MONGODB_URI`, `CLIENT_ORIGIN`

### MongoDB Atlas

Create a cluster, allow your backend host IP, create a database user, and set `MONGODB_URI` in Render.

## AI Pipeline

1. Intent Detection: `server/services/aiService.js` asks OpenAI for structured intent JSON.
2. Context Processing: recent session messages are included in prompt context.
3. Data Matching: `resourceService.js` ranks resources from JSON or MongoDB.
4. AI Response Generation: OpenAI formats a concise domain-safe answer using only matched resources.

The model uses `temperature: 0.3` and `top_p: 0.8` to favor stable, factual recommendations while still sounding natural.
