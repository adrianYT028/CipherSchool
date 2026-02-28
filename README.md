# CipherSQLStudio

A browser-based SQL learning platform where students practice SQL queries against pre-configured assignments with real-time execution and intelligent LLM-powered hints.

## Architecture

```
client/  (React + Vite)          server/  (Node.js + Express)
  |                                 |
  +-- src/                         +-- src/
       +-- api/                         +-- config/     (DB connections)
       +-- components/                  +-- models/     (Mongoose schemas)
       +-- pages/                       +-- routes/     (API endpoints)
       +-- styles/                      +-- services/   (sandbox, hints)
                                        +-- middleware/ (SQL validation)
                                        +-- scripts/   (seed data)
```

## Prerequisites

- **Node.js** v18 or later
- **MongoDB** instance (Atlas or local)
- **PostgreSQL** v14 or later
- **Groq API key** (for the hint feature)

## Setup

### 1. Clone and install dependencies

```bash
# Server
cd server
npm install
cp .env.example .env
# Edit .env with your credentials

# Client
cd ../client
npm install
cp .env.example .env
```

### 2. Configure environment variables

Edit `server/.env` with your database credentials and API key:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ciphersqlstudio
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ciphersqlstudio_sandbox
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_secret_key_here
CLIENT_ORIGIN=*
```

Make sure the PostgreSQL database exists:
```bash
psql -U postgres -c "CREATE DATABASE ciphersqlstudio_sandbox;"
```

### 3. Seed sample assignments

```bash
cd server
npm run seed
```

This inserts 8 practice assignments (Easy, Medium, Hard) into MongoDB.

### 4. Start the application

```bash
# Terminal 1 - server
cd server
npm run dev

# Terminal 2 - client
cd client
npm run dev
```

The client runs at `http://localhost:5173` and the server at `http://localhost:5000`.

## Features

- **Assignment listing** with difficulty filter (Easy / Medium / Hard)
- **Monaco SQL editor** with syntax highlighting and Ctrl+Enter to execute
- **Sandboxed query execution** using per-session PostgreSQL schemas
- **Real-time results** displayed in formatted tables with error details
- **LLM-powered hints** via Groq (Llama 3.3 70B) - never reveals the full answer
- **Collapsible sample data** viewer showing table schemas and rows
- **Mobile-first responsive** layout (320px, 641px, 1024px, 1281px breakpoints)
- **Dark theme** with glass-morphism panels and smooth animations
- **User authentication** with JWT-based login/signup
- **Attempt history** saves each query attempt and shows success/failure status

## API Endpoints

| Method | Path                    | Description                  |
|--------|-------------------------|------------------------------|
| GET    | /api/assignments        | List all assignments         |
| GET    | /api/assignments/:id    | Get assignment details       |
| POST   | /api/query/execute      | Execute a SQL query          |
| POST   | /api/hint               | Get an LLM-generated hint    |
| POST   | /api/auth/register      | Create new user account      |
| POST   | /api/auth/login         | Login and get JWT token      |
| GET    | /api/auth/me            | Get current user info        |
| POST   | /api/attempts           | Save a query attempt         |
| GET    | /api/attempts/:assignmentId | Get user's attempts     |
| GET    | /api/health             | Health check                 |

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React, Vite, SCSS (BEM)       |
| Editor     | Monaco Editor                 |
| Backend    | Express.js, Node.js           |
| Auth       | JWT (jsonwebtoken), bcryptjs  |
| Sandbox DB | PostgreSQL (schema isolation) |
| Data Store | MongoDB (Mongoose)            |
| LLM        | Groq (Llama 3.3 70B)          |
