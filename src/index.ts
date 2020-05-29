import express from "express";
import path from "path";
import { routes } from "./routes";
import scrf from "csurf";
import cookieParser from "cookie-parser";
import { errorHandler } from "./helpers/errorHandler";
import morgan from "morgan";
import graphqlHTTP from "express-graphql";
import { schema } from "./graphql/index";
import { passportInit } from "./helpers/passport";

// generate tokem secret with crypto module
// import crypto from "crypto";
// const tokenSecret = crypto.randomBytes(64).toString("hex");

const app = express();

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
// parses json body from api calls like fetch('/api/', {id: '123'})
app.use(express.json());
// parses url encoded body when sent from browser
app.use(express.urlencoded({ extended: false }));
passportInit(app);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(morgan("common"));

//HINT: // mount api before csrf to disable scrf
// app.use('/api', api)
app.use(
  "/graphql",
  graphqlHTTP({
    pretty: true,
    graphiql: true,
    schema,
  })
);
// enable scrf check for all routes and all methods except GET, HEAD, OPTION
app.use(scrf({ cookie: { httpOnly: true, secure: false, maxAge: 3600 } }));

// all app routes
app.use(routes);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const PROTO = process.env.TYPE === "prod" ? "https" : "http";
// handle errors
app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.warn(
    "\x1b[32m%s\x1b[0m",
    "[+] listening on =>",
    `${PROTO}://${HOST}:${PORT}`
  );
  console.warn("\x1b[32m%s\x1b[0m", "[+] client OS =>", `${process.platform}`);
  console.warn("\x1b[32m%s\x1b[0m", "[+] entryfile =>", `${__filename}`);
});
