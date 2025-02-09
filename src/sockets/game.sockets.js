const logger = require('../utils/winston');
const config = require('../utils/config');
const jwt = require('jsonwebtoken');

// * Helpers
const {
  sendNextQuestion,
  validateAnswer,
  determineWinner,
} = require('../helpers/game.helper');

const initSockets = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async function (socket, next) {
    console.log('Socket handshake', socket.handshake.auth);
    if (socket.handshake.auth && socket.handshake.auth.token) {
      jwt.verify(
        socket.handshake.auth.token,
        config.JWT_SECRET,
        function (err, decoded) {
          if (err) return next(new Error('Authentication error'));
          socket.decoded = decoded;
          next();
        }
      );
    } else {
      logger.info('Unauthenticated user joined');
      next(new Error('Authentication error'));
    }
  }).on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join a room for the player
    socket.on('join:game', (playerId) => {
      console.log('Joining game', playerId);
      socket.join(playerId);
      logger.info(`[${playerId}] joined the game`);
    });

    // Handle request for the next question
    socket.on('question:request', async (data) => {
      const { sessionId, playerId } = data;
      logger.info(`[${playerId}] question request received`);

      try {
        const { data: question, err: errSendingNextQuestion } =
          await sendNextQuestion({
            sessionId,
            playerId,
          });

        if (errSendingNextQuestion) {
          logger.error(`[${playerId}] ${errSendingNextQuestion}`);
          io.to(playerId).emit('error', { message: errSendingNextQuestion });
          return;
        }

        logger.info(`[${playerId}] question received: ${question.text}`);

        if (question) {
          // Send the next question to the player
          io.to(playerId).emit('question:send', question);
        } else {
          // No more questions, end the game
          io.to(playerId).emit('game:end', { message: 'No more questions' });
        }
      } catch (err) {
        logger.error('An error occurred while sending the next question', err);
        io.to(playerId).emit('error', { message: err.message });
      }
    });

    // Handle answer submission
    socket.on('answer:submit', async (data) => {
      const { sessionId, playerId, questionId, answer } = data;
      logger.info(`[${playerId}] answer submitted`);

      try {
        // Validate answer and update score
        const { data: isCorrect, error: errValidatingAnswer } =
          await validateAnswer({
            sessionId,
            playerId,
            questionId,
            answer,
          });

        if (errValidatingAnswer) {
          io.to(playerId).emit('error', { message: errValidatingAnswer });
          return;
        }

        logger.info(
          `[${playerId}] answer is ${isCorrect ? 'correct' : 'incorrect'}`
        );
        io.to(playerId).emit('answer:result', {
          result: isCorrect ? 'correct' : 'incorrect',
        });

        // Send the next question
        const { data: nextQuestion } = await sendNextQuestion({
          sessionId,
          playerId,
        });

        logger.info(`[${playerId}] next question: ${nextQuestion.text}`);
        if (nextQuestion) {
          io.to(playerId).emit('question:send', nextQuestion);
        } else {
          const { data, error: errDeterminingWinner } = await determineWinner({
            sessionId,
          });
          if (errDeterminingWinner) {
            io.to(playerId).emit('error', { message: errDeterminingWinner });
            return;
          }

          logger.info(`[${playerId}] game ended`);
          logger.info(`[${playerId}] data received: ${data}`);

          if (data) {
            const { winnerId, scores, player1, player2 } = data;

            // Notify both players
            io.to(player1).to(player2).emit('game:end', {
              scores: scores,
              winner: winnerId,
              isTie: !winnerId,
            });
          }
        }
      } catch (error) {
        io.to(playerId).emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Attach io to the app for use in controllers
  return io;
};

module.exports = initSockets;
