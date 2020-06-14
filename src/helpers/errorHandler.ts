import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // handle CSRF token errors here
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403);
    console.error("\x1b[31m%s\x1b[0m", "[x] Error:", err.message);
    console.error("\x1b[31m%s\x1b[0m", "[x] Request Headers:", req?.headers);

    res.render("error", {
      message: "Oops, something went wrong with your form",
      redirectTime: 5,
      redirectUrl: "http://localhost:5000/",
    });
  } else if (!res.headersSent) {
    res.status(err.httpStatusCode || 500);
    res.render("error", {
      message: err.message || "",
      redirectTime: 5,
      redirectUrl: "http://localhost:5000/",
    });
  } else {
    res.render("error", {
      message: err.message || "",
      redirectTime: 5,
      redirectUrl: "http://localhost:5000/",
    });
  }
};
export { errorHandler };
