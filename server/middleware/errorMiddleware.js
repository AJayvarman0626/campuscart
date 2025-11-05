// server/middleware/errorMiddleware.js

// Catch async errors (works with async/await)
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error caught by middleware:", err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// 404 handler for unknown routes
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}   