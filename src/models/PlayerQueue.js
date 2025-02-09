const mongoose = require('mongoose');

const PlayerQueueSchema = new mongoose.Schema({
  playerId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlayerQueue', PlayerQueueSchema);
