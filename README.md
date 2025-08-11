# Tokenomics

A vibrant marketplace for AI tokens with Uniswap-level UX: Markets, Portfolio, Swap, Activity, and Pools.

Frontend + Backend

- frontend/: Vite + React + TypeScript + Tailwind marketplace UI
- server/: Node/Express API aggregator with caching

Quick start

1) Backend
- cd server
- npm ci
- cp .env.example .env
- npm run dev

2) Frontend
- cd frontend
- npm ci
- cp .env.example .env
- npm run dev

Set VITE_BACKEND_BASE in frontend .env to point to the server (default http://localhost:8787).
