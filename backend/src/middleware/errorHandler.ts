import { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error("Error:", err);

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  return c.json(
    {
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
    statusCode,
  );
};
