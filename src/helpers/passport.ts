import passport from "passport";
import { Application } from "express";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import { Request } from "express";
import { getUser } from "./getUser";
import bcrypt from "bcrypt";

const LocalStrategy = passportLocal.Strategy;
const jwtStrategy = passportJWT.Strategy;

function cookieExtractor(req: Request) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt-acc"];
  }
  return token;
}

export function passportInit(app: Application) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, cb) => {
        const [user] = getUser(email);

        if (!user || !bcrypt.compareSync(password, user.password)) {
          return cb(null, false, {
            message: "incorrect username or password",
          });
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
        const [user] = getUser(payload.email);
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
  app.use(passport.session());
  passport.serializeUser((user: any, done) => {
    console.log("serializing user", user);

    return done(null, user.email);
  });
  passport.deserializeUser((email: string, done) => {
    console.log("deserializing user");
    console.log("email", email);

    const [user] = getUser(email);
    return done(null, user);
  });
}
