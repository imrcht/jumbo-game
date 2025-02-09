// * Models
const GameSession = require('../models/GameSession');
const User = require('../models/User');
const Question = require('../models/Question');
const PlayerQueue = require('../models/PlayerQueue');

// * Utils
const logger = require('../utils/winston');
const {
  serverErrorResponse,
  successResponse,
  notFoundResponse,
  createdSuccessResponse,
} = require('../utils/response');

const startGame = async (req, res) => {
  try {
    const { playerId } = req.body;

    console.log('Player ID:', playerId);

    // Validate player
    const existingPlayer = await User.findById(playerId);

    if (!existingPlayer) {
      return notFoundResponse({
        res,
        msg: 'Player not found',
        error: 'Player not found',
      });
    }

    // Check if there's already a waiting player in the queue
    const waitingPlayer = await PlayerQueue.findOne().sort({ createdAt: 1 });

    if (waitingPlayer && waitingPlayer.playerId !== playerId) {
      // Found a match, remove waiting player from queue
      logger.info(`Match found: ${playerId} vs ${waitingPlayer.playerId}`);
      await PlayerQueue.findByIdAndDelete(waitingPlayer._id);

      const player2Id = waitingPlayer.playerId;

      // Fetch 4 random questions
      const questions = await Question.aggregate([{ $sample: { size: 4 } }]);

      // Create a new game session
      const gameSession = new GameSession({
        players: [playerId, player2Id],
        questions: questions.map((q) => q._id),
        scores: new Map([
          [playerId, 0],
          [player2Id, 0],
        ]),
      });

      // Notify both players via WebSocket
      const io = req.app.get('socketio');
      io.to(playerId)
        .to(player2Id)
        .emit('game:init', {
          sessionId: gameSession._id,
          questions: questions.map((q) => ({
            text: q.text,
            choices: q.choices,
          })),
        });

      // Save game session after notifying players
      await gameSession.save();
      logger.info(`Game session created: ${gameSession._id}`);

      return createdSuccessResponse(res, 'Game session created', {
        sessionId: gameSession._id,
      });
    }

    // No match found, add player to queue
    const newQueueEntry = new PlayerQueue({ playerId });
    await newQueueEntry.save();
    logger.info(`Player added to queue: ${playerId}`);

    return successResponse(res, 'Player added to queue', newQueueEntry);
  } catch (err) {
    logger.error(`An error occurred while starting game: `, err);
    return serverErrorResponse({
      res,
      msg: 'An error occurred while starting game',
      error: err,
    });
  }
};

module.exports = { startGame };
