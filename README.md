# AI Social Media Agent

An autonomous yet human-governed AI Social Media Agent that generates, self-critiques, adapts, schedules, and publishes content across social platforms with a human approval loop.

## Core Architecture
- **Agent Orchestration**: LangGraph state machine with interrupts for human approval checkpoints.
- **Backend**: FastAPI + SQLAlchemy 2.0 + SQLite/PostgreSQL + APScheduler.
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Buffer / Planable aesthetic).
- **Platform Connectors**: OAuth 2.0 adapters with encrypted token storage for X (Twitter) & LinkedIn.
- **Publishing Engine**: Timezone-aware cron scheduler with exponential backoff & rate-limit safety.

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Run Tests
```bash
python -m pytest backend/tests/ -v
```
