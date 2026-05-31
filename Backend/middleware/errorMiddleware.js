const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[Error] ${message}\n`, err.stack);
  
  return errorResponse(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = {
  errorHandler
};
