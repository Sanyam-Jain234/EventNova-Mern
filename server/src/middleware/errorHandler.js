export function notFound(req, res, next) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  let status = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  let message = err.message || "Something went wrong";

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors || {})
      .map((error) => error.message)
      .filter(Boolean)
      .join(", ") || "Invalid input";
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate value";
  }

  if (status === 500) {
    console.error(err);
    message = "Server me kuch gadbad hui";
  }
  res.status(status).json({ message });
}