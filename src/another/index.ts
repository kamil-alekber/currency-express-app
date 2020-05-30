import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json("from / route check more");
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const PROTO = process.env.TYPE === "prod" ? "https" : "http";

app.listen(PORT, () => {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "[CORS check server] listening on =>",
    `${PROTO}://${HOST}:${PORT}`
  );
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "[CORS check server] entry file =>",
    __filename
  );
});
