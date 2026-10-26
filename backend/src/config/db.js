const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gvmc_opendata';

  try {
    // Attempt connecting to the configured URI with a 2.5-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Successfully connected to MongoDB at ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[Database] Connection to ${uri} failed (${err.message}).`);
    console.info('[Database] Starting embedded In-Memory MongoDB instance for seamless local operation...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] In-Memory MongoDB running and connected at ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start In-Memory MongoDB:', memErr.message);
      throw memErr;
    }
  }

  return mongoose.connection;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
