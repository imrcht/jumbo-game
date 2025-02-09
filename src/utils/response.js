// Utils
const logger = require('./winston');

const ResponseStatus = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  PAYMENT_REQUIRED: 402,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  ACCESS_DENIED: 440,
  INTERNAL_ERROR: 500,
};

const successResponse = (res, msg, data) => {
  if (data)
    return res.status(ResponseStatus.SUCCESS).send({
      msg,
      data,
    });

  return res.status(ResponseStatus.SUCCESS).send({
    msg,
  });
};

const createdSuccessResponse = (res, msg, data) => {
  res.status(ResponseStatus.CREATED).send({
    msg,
    data,
  });
};

const errorResponse = ({ res, msg, error, meta = {}, code }) => {
  if (!msg) {
    msg = 'An error occurred, please try again later or contact support';
  }
  if (!error) error = msg;
  res.status(code).send({
    msg,
    error,
    meta,
  });
};

const notFoundResponse = ({ res, msg, error }) => {
  if (!msg) {
    msg = 'Resource not found. Please try again later or contact support';
  }
  if (!error) error = msg;
  res.status(ResponseStatus.NOT_FOUND).send({
    msg,
    error,
  });
};

const unauthorizedResponse = ({ res, msg, error }) => {
  if (!msg) {
    msg = 'Unauthorized. Please check your credentials or contact support';
  }
  if (!error) error = msg;
  res.status(ResponseStatus.UNAUTHORIZED).send({
    msg,
    error,
  });
};

const badRequestResponse = ({ res, msg, error, meta = {} }) => {
  if (!msg) msg = 'Invalid request. Please try again later or contact support';
  if (!error) error = msg;
  res.status(ResponseStatus.BAD_REQUEST).send({
    msg,
    error,
    meta,
  });
};

const forbiddenResponse = ({ res, msg, error }) => {
  if (!msg) msg = 'Access denied. Please contact support for assistance';
  if (!error) error = msg;
  res.status(ResponseStatus.FORBIDDEN).send({
    msg,
    error,
  });
};

const serverErrorResponse = ({ res, msg, error, meta = {} }) => {
  if (!msg) {
    msg = 'An error occurred, please try again later or contact support';
  }
  if (!error) error = msg;
  res.status(ResponseStatus.INTERNAL_ERROR).send({
    msg,
    error,
    meta,
  });
};

const accessDeniedResponse = ({ res, msg, error }) => {
  if (!msg) msg = 'Access denied. Please contact support for assistance';
  if (!error) error = msg;
  res.status(ResponseStatus.ACCESS_DENIED).send({
    msg,
    error,
  });
};

const unprocessableEntityResponse = ({ res, msg, error }) => {
  // so that we can see why JOI failed in logs while debugging
  if (msg) logger.error(`JOI validation failed: ${msg}`);
  if (!msg) {
    msg =
      "We're unable to fulfill your request at this time. Please try again later or contact support";
  }
  if (!error) error = msg;
  res.status(ResponseStatus.UNPROCESSABLE_ENTITY).send({
    msg,
    error,
  });
};

const paymentRequiredResponse = ({ res, msg, error }) => {
  if (!msg) {
    msg =
      'Payment required. Please complete the payment process or contact support';
  }
  if (!error) error = msg;
  res.status(ResponseStatus.PAYMENT_REQUIRED).send({
    msg,
    error,
  });
};

module.exports = {
  successResponse,
  createdSuccessResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  badRequestResponse,
  forbiddenResponse,
  serverErrorResponse,
  accessDeniedResponse,
  unprocessableEntityResponse,
  paymentRequiredResponse,
};
