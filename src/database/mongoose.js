const mongoose = require('mongoose');
const config = require('../utils/config');
const logger = require('../utils/winston');

const MONGO_URI = config.MONGODB_URI;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDb Connected: ${conn.connection.host}`);
  } catch (err) {
    // console.error(err);
    logger.error(`MongoDb Connection Error: ${err}`);
  }
};

module.exports = connectDB;
