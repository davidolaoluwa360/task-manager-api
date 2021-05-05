//* handling error with express error middleware
exports.errorMiddleware = (error, req, res, next) => {
  return res.status(error.statusCode || 400).json({ error: error.message });
};
