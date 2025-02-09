const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
};
