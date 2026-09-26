// utils/responseFormatter.js
export function successResponse(res, { statusCode = 200, message = "Success", data = null }) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function errorResponse(res, { statusCode = 400, message = "Error", error = null }) {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
}