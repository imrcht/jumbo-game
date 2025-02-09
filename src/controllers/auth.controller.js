const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  createdSuccessResponse,
  successResponse,
  serverErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
} = require('../utils/response');
const config = require('../utils/config');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();

    const createdUser = user.toJSON();
    delete createdUser.password;
    return createdSuccessResponse(
      res,
      'User created successfully',
      createdUser
    );
  } catch (err) {
    return serverErrorResponse({
      res,
      msg: 'An error occurred while creating user',
      error: err,
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return notFoundResponse({
        res,
        msg: 'User with the provided username not found',
        error: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return unauthorizedResponse({
        res,
        msg: 'Invalid credentials',
        error: 'Invalid credentials',
      });
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: '1h',
    });

    const responseData = {
      token,
      ...user.toJSON(),
    };

    delete responseData.password;
    return successResponse(res, 'Login successful', responseData);
  } catch (err) {
    return serverErrorResponse({
      res,
      msg: 'An error occurred while logging in',
      error: err,
    });
  }
};

module.exports = { register, login };
