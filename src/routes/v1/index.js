// * Packages
const express = require('express');
const app = express();

// * Imported routes
const authRoutes = require('./auth.routes');
const gameRoutes = require('./game.routes');
const questionRoutes = require('./question.routes');

// * Use routes
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/question', questionRoutes);

module.exports = app;
