const GameSession = require('../models/GameSession');
const logger = require('../utils/winston');

const sendNextQuestion = async ({ sessionId, playerId }) => {
  try {
    const gameSession = await GameSession.findById(sessionId).populate(
      'questions'
    );
    if (!gameSession)
      return {
        data: null,
        error: 'Game session not found',
      };

    // Get the current question index for the player
    const currentIndex = gameSession.currentQuestionIndex.get(playerId) || 0;

    // Check if all questions have been answered
    if (currentIndex >= gameSession.questions.length) {
      return {
        data: false,
        error: null,
      };
    }

    // Get the next question
    const question = gameSession.questions[currentIndex];

    // Increment the question index for the player
    gameSession.currentQuestionIndex.set(playerId, currentIndex + 1);
    await gameSession.save();

    return {
      data: {
        questionId: question._id,
        text: question.text,
        choices: question.choices,
      },
      error: null,
    };
  } catch (err) {
    logger.error(`An error occurred while sending next question: `, err);
    return {
      data: null,
      error: err.message,
    };
  }
};

const validateAnswer = async ({ sessionId, playerId, questionId, answer }) => {
  const gameSession = await GameSession.findById(sessionId).populate(
    'questions'
  );
  if (!gameSession)
    return {
      data: false,
      error: 'Game session not found',
    };

  const question = gameSession.questions.find((q) => q._id.equals(questionId));
  if (!question)
    return {
      data: false,
      error: 'Question not found',
    };

  const isCorrect = question.correctAnswer === answer;

  // Update the player's score
  if (isCorrect) {
    const currentScore = gameSession.scores.get(playerId) || 0;
    gameSession.scores.set(playerId, currentScore + 1);
    await gameSession.save();
  }

  return {
    data: isCorrect,
    error: null,
  };
};

const determineWinner = async ({ sessionId }) => {
  try {
    // Assuming there are only 2 players in each game session
    // Check if both players have finished
    const gameSession = await GameSession.findById(sessionId);
    const player1 = gameSession.players[0].toString();
    const player2 = gameSession.players[1].toString();

    const p1Index = gameSession.currentQuestionIndex.get(player1) || 0;
    const p2Index = gameSession.currentQuestionIndex.get(player2) || 0;

    if (p1Index >= 4 && p2Index >= 4 && gameSession.status !== 'completed') {
      // Calculate scores
      const p1Score = gameSession.scores.get(player1) || 0;
      const p2Score = gameSession.scores.get(player2) || 0;

      // Determine winner
      let winnerId = null;
      if (p1Score > p2Score) winnerId = player1;
      else if (p2Score > p1Score) winnerId = player2;

      // Update the game session
      gameSession.winner = winnerId;
      gameSession.status = 'completed';
      await gameSession.save();

      return {
        data: {
          winnerId,
          scores: [
            {
              playerId: player1,
              score: p1Score,
            },
            {
              playerId: player2,
              score: p2Score,
            },
          ],
          player1,
          player2,
        },
        error: null,
      };
    }
    return {
      data: false,
      error: null,
    };
  } catch (err) {
    logger.error(`An error occurred while determining winner: `, err);
    return {
      data: null,
      error: err.message,
    };
  }
};

module.exports = {
  sendNextQuestion,
  validateAnswer,
  determineWinner,
};
