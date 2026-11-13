# UCISP

Unified College Information Search Platform with two panels: a read-only user experience and an administrator experience. The backend keeps resource documents authoritative in MongoDB, schedules asynchronous indexing work through E1, persists postings through E2, and searches the in-memory inverted index through E3. E4 exposes the engines as a validated REST API.

## Prerequisites

- Node.js 20+
- MongoDB 7+ (a replica set is required for transactional index updates)

## Setup

```powershell
npm install
npm --prefix server install
npm --prefix client install
Copy-Item server\.env.example server\.env
```

Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` in `server/.env`. Initialize an administrator with:

```powershell
npm --prefix server run seed:admin -- --email admin@example.com --password "change-me" --name "UCISP Admin"
npm --prefix server run seed:sample
```

Run both applications with `npm run dev`. The API listens on port 5000 and Vite on port 5173.

The sample seed is safe to run repeatedly. It adds representative notices, placement drives, events, faculty, and academic resources once an administrator exists.

For a complete local demo setup with known credentials, run:

```powershell
npm --prefix server run seed:demo
```

Demo login: `admin@example.com` / `Admin@123`. Change this password before using the application beyond local development.

## Engines

- **E1 / OS:** `server/engines/os` implements FCFS and priority scheduling, atomic task claiming, leases, retries, and worker execution.
- **E2 / DBMS:** `server/engines/dbms` owns transactional MongoDB posting replacement and restart recovery.
- **E3 / DAA:** `server/engines/daa` owns normalization, hash-map inverted lookup, Trie autocomplete, and configurable ranking.
- **E4 / Web:** `server/engines/web` owns API responses, validation, authentication middleware, routes, and error handling.

Run engine tests with `npm test`.
