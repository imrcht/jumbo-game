const Question = require('../models/Question');

// * Utils
const logger = require('../utils/winston');
const { serverErrorResponse, successResponse } = require('../utils/response');

const insertQuestion = async (req, res) => {
  try {
    const { text, choices, correctAnswer } = req.body;
    const question = new Question({ text, choices, correctAnswer });
    await question.save();

    return successResponse(res, 'Question created successfully', question);
  } catch (err) {
    return serverErrorResponse({
      res,
      msg: 'An error occurred while creating question',
      error: err,
    });
  }
};

module.exports = {
  insertQuestion,
};
