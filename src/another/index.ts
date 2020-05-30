import express from "express";
import request from "request-promise-native";
import path from "path";

const app = express();
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const data = await request("http://localhost:5000/api", { method: "GET" });

  console.log(data);
  res.render("index", { data });
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
