const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  scores: { type: Map, of: Number, default: {} },
  currentQuestionIndex: { type: Map, of: Number, default: {} }, // Track current question index for each player
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'in-progress',
  },
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
