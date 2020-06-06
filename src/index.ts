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
import { SubscriptionServer } from "subscriptions-transport-ws";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { altairExpress } from "altair-express-middleware";
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
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";
const PROTO = process.env.TYPE === "prod" ? "https" : "http";
// const subscriptionsEndpoint = `ws://localhost:${PORT}/graphql`;
app.use(
  "/graphql",
  (req, res, next) => {
    console.log("\x1b[32m%s\x1b[0m", "INCOMING qraphql req =>", req.body);
    next();
  },
  graphqlHTTP({
    pretty: true,
    schema,
  })
);
// enable scrf check for all routes and all methods except GET, HEAD, OPTION
app.use(scrf({ cookie: { httpOnly: true, secure: false, maxAge: 3600 } }));

// all app routes
app.use(routes);

// handle errors
app.use(errorHandler);

app.use(
  "/graphql-altair",
  altairExpress({
    endpointURL: "/graphql",
    subscriptionsEndpoint: `ws://${HOST}:${PORT}/graphql`,
  })
);

const server = createServer(app);

server.listen(PORT, HOST, () => {
  console.warn(
    "\x1b[32m%s\x1b[0m",
    `[+] ${PROTO.toUpperCase()} server is listening on =>`,
    `${PROTO}://${HOST}:${PORT}`
  );
  // Set up the WebSocket for handling GraphQL subscriptions.

  new SubscriptionServer(
    {
      subscribe,
      execute,
      schema,
    },
    {
      server,
      path: "/graphql",
    }
  );
  console.warn(
    "\x1b[32m%s\x1b[0m",
    "[+] WS server is ready at",
    `ws://${HOST}:${PORT}/graphql`
  );
  console.warn("\x1b[32m%s\x1b[0m", "[+] client OS =>", `${process.platform}`);
  console.warn("\x1b[32m%s\x1b[0m", "[+] entryfile =>", `${__filename}`);
});
