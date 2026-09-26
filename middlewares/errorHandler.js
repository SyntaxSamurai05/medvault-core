import { errorResponse } from "../utils/responseFormatter.js";

export function errorHandler(err, req, res, next) {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return errorResponse(res, {
    statusCode,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}