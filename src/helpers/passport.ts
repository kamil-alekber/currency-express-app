import passport from "passport";
import { Application } from "express";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import { users } from "../db/index";
import { Request } from "express";

const LocalStrategy = passportLocal.Strategy;
const jwtStrategy = passportJWT.Strategy;

function cookieExtractor(req: Request) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
}

export function passportInit(app: Application) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, cb) => {
        const user = users.find(
          (user) => user.email === email && user.password === password
        );

        if (!user) {
          cb(null, false, { message: "incorrect username or password son" });
        }

        return cb(null, user, { message: "Logged in to the system" });
      }
    )
  );
  passport.use(
    new jwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process?.env?.TOKEN_SECRET || "test123",
      },
      (payload, cb) => {
        const user = users.find((user) => user.email === payload.email);
        if (!user) {
          return cb(new Error("jwt find user error"), null, {
            message: "no user in the database",
          });
        }

        return cb(null, user, { message: "verified with JWT" });
      }
    )
  );

  app.use(passport.initialize());
}
