const express = require('express');
const { startGame } = require('../../controllers/game.controller');

const router = express.Router();

router.post('/start', startGame);

module.exports = router;
