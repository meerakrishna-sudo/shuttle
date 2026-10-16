/**
 * Jest global setup: start an in-memory MongoDB REPLICA SET before tests run.
 *
 * Why a replica set and not a standalone server?
 * MongoDB transactions (startSession / startTransaction) only work on replica
 * sets or mongos (sharded cluster). Our booking service uses transactions to
 * make seat booking atomic. A single-node replica set fully supports this —
 * it's the standard pattern for testing with transactions.
 *
 * mongodb-memory-server spins up a real MongoDB process in memory.
 * Tests hit a real database (not mocks) so we catch bugs that mock DBs hide.
 */
const { MongoMemoryReplSet } = require('mongodb-memory-server');

module.exports = async () => {
  const replset = await MongoMemoryReplSet.create({
    replSet: { count: 1 }, // single-node replica set — enough for transactions
  });
  const uri = replset.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long';
  process.env.NODE_ENV = 'test';
  global.__MONGOD__ = replset;
};
