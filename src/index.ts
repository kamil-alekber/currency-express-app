import express from "express";
import path from "path";
import { routes } from "./routes";

const app = express();

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
// parses json body from api calls like fetch('/api/', {id: '123'})
app.use(express.json());
// parses url encoded body when sent from browser
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "public")));
// all app routes
app.use(routes);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const PROTO = process.env.TYPE === "prod" ? "https" : "http";

app.listen(PORT, HOST, () => {
  console.warn(
    `[+] listening on => ${PROTO}://${HOST}:${PORT}\n[+] client OS => ${process.platform}\n[+] entryfile => ${__filename}`
  );
});
