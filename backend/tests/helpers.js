const mongoose = require('mongoose');
const User = require('../src/models/User');
const Route = require('../src/models/Route');
const Vehicle = require('../src/models/Vehicle');
const Journey = require('../src/models/Journey');
const BusStop = require('../src/models/BusStop');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const clearDB = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  await Promise.all(collections.map((name) => mongoose.connection.collections[name].deleteMany({})));
};

const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
};

const createUser = async (overrides = {}) => {
  const defaults = {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    passwordHash: await bcrypt.hash('password123', 10),
    role: 'Passenger',
  };
  return User.create({ ...defaults, ...overrides });
};

const tokenFor = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

const createStop = (overrides = {}) =>
  BusStop.create({ name: 'Stop A', code: `SA${Date.now()}`, isActive: true, ...overrides });

const createRoute = async (originId, destinationId) =>
  Route.create({
    routeCode: `R${Date.now()}`,
    name: 'Test Route',
    origin: originId,
    destination: destinationId,
    pricePerSeat: 50,
    isActive: true,
  });

const createVehicle = () =>
  Vehicle.create({
    plateNumber: `KA${Date.now()}`,
    model: 'Volvo 9400',
    totalSeats: 40,
    owner: { name: 'Campus Transport' },
    status: 'Active',
  });

const createJourney = async (routeId, vehicleId, driverId, overrides = {}) =>
  Journey.create({
    route: routeId,
    vehicle: vehicleId,
    driver: driverId,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    departureTime: '08:00',
    totalSeats: 10,
    bookedSeats: 0,
    status: 'Scheduled',
    ...overrides,
  });

module.exports = { clearDB, connectDB, createUser, tokenFor, createStop, createRoute, createVehicle, createJourney };
