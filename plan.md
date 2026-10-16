# Shuttle — Build Plan

## The story we're telling
> "I took an existing campus shuttle application, substantially improved its backend architecture and booking reliability, optimized its database access, containerized it and deployed it to Google Cloud."

---

## Phase 1 — Backend Foundation ✅ COMPLETE
Set up the layered backend from scratch with proper architecture.

### Files to create
- [x] Backend package.json + server.js
- [x] Config: db.js, redis.js
- [x] Utils: AppError.js, apiResponse.js, logger.js
- [x] Middleware: auth.js, authorize.js, errorHandler.js, requestLogger.js
- [x] Validators: authValidator.js, bookingValidator.js, journeyValidator.js
- [x] Models: User, Journey, Route, BusStop, Vehicle, Booking
- [x] Services: authService, bookingService, journeyService, routeService, vehicleService
- [x] Controllers: all 6
- [x] Routes: all 6 routers

**Key design decision: Services layer**
The controller receives the HTTP request and calls a service. The service talks to the database. This means you can test your business logic (e.g. booking) without mocking HTTP — just call the service function directly.

---

## Phase 2 — Database Work (DBMS Evidence) ✅ COMPLETE (built into Phase 1)
This is what you talk about in interviews.

- [ ] Indexes on User (email), Journey (date, status, route), Booking (userId, journeyId)
- [ ] Atomic booking with `findOneAndUpdate` — fixes the race condition
- [ ] MongoDB transaction for booking (create Booking + update Journey atomically)
- [ ] Pagination on all list endpoints (page, limit, cursor)
- [ ] Efficient queries: `.lean()`, `.select()`, compound lookups

**The race condition explained (for interviews):**
Without atomicity: two users both read `bookedSeats=49, totalSeats=50`. Both see 1 seat free. Both create a booking. Both increment to 50. Now 51 seats are "booked" on a 50-seat bus.

With `findOneAndUpdate` + `$expr`: MongoDB evaluates the condition AND does the update in one operation, at the database level. Only one of the two concurrent requests can win — the other gets back `null` and we return a 409 Conflict.

---

## Phase 3 — Redis Caching ✅ COMPLETE (built into services)
Add Redis only where it makes sense, and measure it.

- [ ] Cache route listings (TTL 10 min — routes change rarely)
- [ ] Cache journey search results (TTL 2 min — seats change, can't cache forever)
- [ ] Cache bus stop list (TTL 30 min — very static)
- [ ] Log cache hit/miss in responses (x-cache-status header)
- [ ] Benchmark: measure response time with and without cache in README

---

## Phase 4 — Tests ✅ PARTIAL (auth + booking including race condition; more coverage needed)
Meaningful tests, not boilerplate.

- [ ] Auth: register, login, invalid credentials, duplicate email
- [ ] Authorization: passenger can't access admin routes
- [ ] Booking: book a seat, overbooking attempt, concurrent booking race
- [ ] Journey search: valid/invalid filters, pagination
- [ ] Integration test: full booking flow end-to-end

---

## Phase 5 — Frontend ✅ COMPLETE
Clean, well-organized React app. Same features as base, but properly structured.

- [ ] Context: AuthContext, JourneyContext
- [ ] API service layer (axios with interceptors, auto-attach JWT)
- [ ] Protected routes per role
- [ ] Pages: Login, Register, Admin Dashboard, Driver Dashboard, Passenger Dashboard
- [ ] Components: properly separated, reusable

---

## Phase 6 — Docker ✅ COMPLETE
- [ ] backend/Dockerfile
- [ ] frontend/Dockerfile
- [ ] docker-compose.yml (frontend + backend + mongo + redis)
- [ ] .env.example files

---

## Phase 7 — GCP Deployment 🔜 (cloudbuild.yaml ready, needs GCP project setup)
- [ ] Cloud Build trigger from GitHub
- [ ] Artifact Registry for Docker images
- [ ] Cloud Run for both services
- [ ] Cloud Memorystore or Redis on Cloud Run
- [ ] Update README with live URL

---

## Architecture decisions log

| Decision | Why |
|---|---|
| Services layer between controllers and DB | Testable business logic, clean separation |
| Joi for validation | Declarative schemas, better than manual if-checks |
| Winston for logging | Structured JSON logs, easy to ship to GCP Cloud Logging |
| MongoDB transactions for booking | Atomicity — no partial writes if something crashes mid-booking |
| Redis TTL caching for routes | Routes are read 100x more than they're written, caching is justified |
| JWT in Authorization header | Stateless, scales horizontally, no session store needed |
