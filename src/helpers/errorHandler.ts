import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // handle CSRF token errors here
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403);
    console.error("[x] Error:", err.message);
    res.render("error", {
      message: "Oops, something went wrong with your form",
      redirectTime: 5,
      redirectUrl: "http://localhost:5000/",
    });
  } else {
    return next(err);
  }
};
export { errorHandler };
