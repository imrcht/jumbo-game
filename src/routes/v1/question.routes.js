const express = require('express');
const { insertQuestion } = require('../../controllers/question.controller');

const router = express.Router();

router.post('/insert', insertQuestion);

module.exports = router;
