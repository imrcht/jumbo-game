const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const initSockets = require('./sockets/game.sockets');
const config = require('./utils/config');
const mongooseConnection = require('./database/mongoose');
const logger = require('./utils/winston');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const v1Routes = require('./routes/v1');

app.use('/v1', v1Routes);

app.get('/', (_, res) => {
  res.status(200).send('Jumbo backend task up and running');
});

// Database connection
mongooseConnection();

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

// Initialize WebSockets
const io = initSockets(server);
app.set('socketio', io); // Attach io to the app
