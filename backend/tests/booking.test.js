/**
 * Booking tests — the most important test file.
 *
 * The race condition test is the most interesting one:
 * We fire 10 concurrent requests for the same single seat.
 * With our atomic findOneAndUpdate, exactly 1 should succeed.
 * Without atomicity, 2 or more would succeed (the bug).
 */
const request = require('supertest');
const app = require('../server');
const Journey = require('../src/models/Journey');
const {
  clearDB, connectDB, createUser, tokenFor,
  createStop, createRoute, createVehicle, createJourney,
} = require('./helpers');

let passenger, driver, adminUser, vehicle, route, origin, destination;

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());

beforeEach(async () => {
  passenger = await createUser({ role: 'Passenger' });
  driver = await createUser({ role: 'Driver', licenseNumber: 'DL123' });
  adminUser = await createUser({ role: 'Admin' });
  origin = await createStop({ name: 'Campus Gate', code: 'CG01' });
  destination = await createStop({ name: 'City Center', code: 'CC01' });
  route = await createRoute(origin._id, destination._id);
  vehicle = await createVehicle();
});

describe('POST /api/bookings', () => {
  test('passenger can book available seats', async () => {
    const journey = await createJourney(route._id, vehicle._id, driver._id, { totalSeats: 10 });
    const token = tokenFor(passenger);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ journeyId: journey._id, seatNumbers: ['1A', '1B'], paymentMethod: 'UPI' });

    expect(res.status).toBe(201);
    expect(res.body.data.booking.seatNumbers).toEqual(['1A', '1B']);

    const updated = await Journey.findById(journey._id);
    expect(updated.bookedSeats).toBe(2);
  });

  test('returns 409 when no seats available', async () => {
    const journey = await createJourney(route._id, vehicle._id, driver._id, {
      totalSeats: 2, bookedSeats: 2,
    });
    const token = tokenFor(passenger);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ journeyId: journey._id, seatNumbers: ['1A'], paymentMethod: 'UPI' });

    expect(res.status).toBe(409);
  });

  test('returns 400 for cancelled journey', async () => {
    const journey = await createJourney(route._id, vehicle._id, driver._id, { status: 'Cancelled' });
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenFor(passenger)}`)
      .send({ journeyId: journey._id, seatNumbers: ['1A'] });
    expect(res.status).toBe(400);
  });

  test('returns 403 when driver tries to book', async () => {
    const journey = await createJourney(route._id, vehicle._id, driver._id);
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenFor(driver)}`)
      .send({ journeyId: journey._id, seatNumbers: ['1A'] });
    expect(res.status).toBe(403);
  });

  test('returns 400 for invalid journeyId format', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenFor(passenger)}`)
      .send({ journeyId: 'not-a-valid-id', seatNumbers: ['1A'] });
    expect(res.status).toBe(400);
  });

  /**
   * RACE CONDITION TEST — the most important test.
   *
   * We have a journey with exactly 1 seat left.
   * We fire 10 concurrent booking requests for that 1 seat.
   *
   * Expected: exactly 1 succeeds (201), the rest get 409.
   * Without atomicity: multiple would succeed (the bug we fixed).
   */
  test('concurrent bookings: exactly 1 wins for 1 remaining seat', async () => {
    const journey = await createJourney(route._id, vehicle._id, driver._id, {
      totalSeats: 1,
      bookedSeats: 0,
    });

    const passengers = await Promise.all(
      Array.from({ length: 10 }, (_, i) => createUser({ email: `racer${i}@test.com` }))
    );

    const results = await Promise.all(
      passengers.map((p) =>
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${tokenFor(p)}`)
          .send({ journeyId: journey._id, seatNumbers: [`${p._id.toString().slice(-3)}`] })
      )
    );

    const successes = results.filter((r) => r.status === 201);
    const failures = results.filter((r) => r.status !== 201);

    // The critical invariant: exactly one booking succeeds, the rest fail
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(9);

    // The database-level guarantee: bookedSeats never exceeded totalSeats
    const finalJourney = await Journey.findById(journey._id);
    expect(finalJourney.bookedSeats).toBe(1);
  }, 15000);
});

describe('PATCH /api/bookings/:id/cancel', () => {
  test('passenger can cancel their own booking', async () => {
    const journey = await createJourney(route._id, vehicle._id, driver._id);
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenFor(passenger)}`)
      .send({ journeyId: journey._id, seatNumbers: ['2A'] });

    const bookingId = bookingRes.body.data.booking._id;
    const cancelRes = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${tokenFor(passenger)}`);

    expect(cancelRes.status).toBe(200);

    // Seats should be released back
    const updated = await Journey.findById(journey._id);
    expect(updated.bookedSeats).toBe(0);
  });

  test('cannot cancel another passenger booking', async () => {
    const other = await createUser({ email: 'other@test.com' });
    const journey = await createJourney(route._id, vehicle._id, driver._id);
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tokenFor(passenger)}`)
      .send({ journeyId: journey._id, seatNumbers: ['2A'] });

    const bookingId = bookingRes.body.data.booking._id;
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${tokenFor(other)}`);

    expect(res.status).toBe(404); // "not found" for this user (don't leak existence)
  });
});

describe('GET /api/bookings/my', () => {
  test('returns paginated bookings for the logged-in passenger', async () => {
    const journey = await createJourney(route._id, vehicle._id, driver._id, { totalSeats: 20 });
    const token = tokenFor(passenger);

    await request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`)
      .send({ journeyId: journey._id, seatNumbers: ['1A'] });

    const res = await request(app).get('/api/bookings/my').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });
});
