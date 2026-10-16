# Shuttle — Scalable Campus Transit & Booking Platform

A full-stack campus shuttle booking system with concurrency-safe seat booking, Redis caching, Docker containerization, and GCP deployment.

> Built with React, Node.js, Express, MongoDB, Redis, Docker, and Google Cloud Run.

---

## Quick start (local development)

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (optional — app works without it, just no caching)

### Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI and JWT_SECRET in .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Docker (recommended)

Runs everything with one command:

```bash
# Copy backend env file
cp backend/.env.example backend/.env
# Edit backend/.env: set JWT_SECRET to something long and random

docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/health](http://localhost:5000/health)

---

## Run tests

```bash
cd backend
npm install
npm test
```

Tests use an in-memory MongoDB instance — no setup needed.

---

## Architecture

```
Frontend (React + Vite)
    ↓ HTTP (axios with JWT interceptor)
Backend (Express)
    ├── routes/       — URL definitions + middleware chain
    ├── controllers/  — HTTP in, HTTP out (thin layer)
    ├── services/     — business logic (this is where the real work happens)
    ├── models/       — MongoDB schemas + indexes
    ├── middleware/   — auth, authorization, error handler, logger
    └── validators/   — Joi schemas (reject bad input before it hits the DB)
    ↓
MongoDB        — primary datastore
Redis          — cache layer (route listings, journey search)
```

---

## Database design decisions

### Indexes

| Collection | Index | Why |
|---|---|---|
| User | `email` (unique) | Fast login lookup, enforces uniqueness |
| User | `(role, isActive)` | Listing active drivers for journey assignment |
| Journey | `(route, date, status)` | Passenger search query |
| Journey | `(driver, date)` | Driver's upcoming journeys |
| Booking | `(user, status)` | Passenger's booking history |
| Booking | `journey` | All passengers on a journey |
| BusStop | `name` (text) | Full-text search for stops |

### The concurrency problem (and the fix)

**The problem:** Two passengers try to book the last available seat simultaneously.

Without atomicity:
1. Request A reads `bookedSeats=49, totalSeats=50` → sees 1 seat free
2. Request B reads `bookedSeats=49, totalSeats=50` → sees 1 seat free
3. Both create a booking and increment `bookedSeats` → now `bookedSeats=51` on a 50-seat bus

**The fix (in `bookingService.js`):**

```javascript
const journey = await Journey.findOneAndUpdate(
  {
    _id: journeyId,
    $expr: { $lte: [{ $add: ['$bookedSeats', seatCount] }, '$totalSeats'] }
  },
  { $inc: { bookedSeats: seatCount } },
  { new: true, session }
);
// If null → no seats available (someone else got there first)
if (!journey) throw new AppError('No seats available', 409);
```

`findOneAndUpdate` is a single atomic MongoDB operation. The condition check and the increment happen together at the database level — no two operations can interleave. Only one request wins; the others get `null` back and receive a 409.

This is wrapped in a MongoDB **transaction** (`session.startTransaction()`), so if `Booking.create()` fails after the increment, the increment is automatically rolled back.

---

## Redis caching

| Cache key | TTL | Why this TTL? |
|---|---|---|
| `routes:list:*` | 10 min | Routes change very rarely |
| `busstops:*` | 30 min | Bus stops almost never change |
| `journeys:search:*` | 2 min | Seat counts change as bookings come in |

Every response that was served from cache includes `x-cache-status: HIT` header. You can measure the difference:

```bash
# First request (cache MISS): ~45ms
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/routes

# Second request (cache HIT): ~3ms
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/routes
```

Cache is invalidated on every write (create/update/delete) to maintain consistency.

---

## API reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | any | Current user |

### Journeys
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/journeys/search` | — | Search by origin/destination/date |
| GET | `/api/journeys/my` | Driver | Driver's assigned journeys |
| GET | `/api/journeys` | Admin | All journeys (paginated) |
| POST | `/api/journeys` | Admin | Schedule journey |
| PATCH | `/api/journeys/:id` | Admin/Driver | Update status |

### Bookings
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | Passenger | Book seats |
| GET | `/api/bookings/my` | Passenger | My bookings |
| PATCH | `/api/bookings/:id/cancel` | Passenger | Cancel booking |
| GET | `/api/bookings/journey/:id` | Admin/Driver | Passengers on a journey |

All responses follow:
```json
{ "success": true, "message": "...", "data": {...} }
```
Paginated responses also include a `pagination` object.

---

## GCP Deployment

See `cloudbuild.yaml`. Pipeline:

```
GitHub push → Cloud Build → Docker build → Artifact Registry → Cloud Run
```

Setup steps:
1. Create Artifact Registry repo: `gcloud artifacts repositories create shuttle --repository-format=docker --location=us-central1`
2. Store secrets: `echo -n "mongodb+srv://..." | gcloud secrets create shuttle-mongo-uri --data-file=-`
3. Connect GitHub repo in Cloud Build console
4. Push to `main` — the pipeline runs automatically

---

## What I learned / improved

- **MongoDB transactions** — atomic multi-document operations; either all succeed or none do
- **Race condition fix** — `findOneAndUpdate` with `$expr` filter for concurrency-safe seat booking
- **Services layer** — business logic separated from HTTP handling; easier to test and reason about
- **Redis caching** — measurable latency improvement on read-heavy endpoints
- **JWT authentication** — stateless, horizontally scalable; what's in the token and why
- **Docker multi-stage builds** — smaller production images by separating build and runtime stages
- **Cloud Build CI/CD** — automated deployment on every push
