const mongoose = require('mongoose');

/**
 * Check if MongoDB is currently connected.
 * readyState values:
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { isConnected };
