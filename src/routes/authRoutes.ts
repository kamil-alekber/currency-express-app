import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { getUser } from "../helpers/getUser";

const router = Router();

function generateAccessToken(user: any) {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("Should provide token secret in your ENV file");
  }

  // expires after 30 mins
  return jwt.sign({ email: user.email }, process.env.TOKEN_SECRET, {
    expiresIn: "10s",
  });
}

function generateRefreshToken(user: { email: string; tokenVersion: string }) {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("Should provide token secret in your ENV file");
  }
  return jwt.sign(
    { email: user.email, tokenVersion: user.tokenVersion },
    process.env.TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

/** LOGIN **/
router
  .route("/login")
  .get((req, res) => {
    res.render("login", { _csrf: req.csrfToken(), message: null });
  })
  .post((req, res) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        console.error("\x1b[31m%s\x1b[0m", "[x] Auth Error:", err);
        res.status(400).json({
          message: info ? info.message : "Login Failed",
          user: user,
        });
      }

      req.login(user, (err) => {
        const jwtAccessToken = generateAccessToken(user);
        const jwtRefreshToken = generateRefreshToken(user);

        console.warn(
          "\x1b[32m%s\x1b[0m",
          `[+] Login... generating access token for [${user.email}]:`,
          jwtAccessToken
        );
        res.cookie("jwt-acc", jwtAccessToken, {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 10,
        });
        res.cookie("jwt-ref", jwtRefreshToken, {
          httpOnly: true,
          secure: false,
          // 7 days-cookie
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.redirect("/");
      });
    })(req, res);
  });

/** REGISTER **/
router
  .route("/register")
  .get((req, res) => {
    res.render("register", { _csrf: req.csrfToken(), message: null });
  })
  .post(async (req, res) => {
    try {
      const [user, data] = getUser(req.body.email);
      if (user) {
        res.render("register", {
          _csrf: req.csrfToken(),
          message: "user with the following email already registered",
        });
      } else {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const newData = [
          {
            users: [
              ...data[0].users,
              {
                email: req.body.email,
                password: hashedPassword,
                tokenVersion: 1,
              },
            ],
          },
        ];

        fs.writeFileSync(
          path.resolve(__dirname, "../../src/db/users.json"),
          JSON.stringify(newData),
          { encoding: "utf8", flag: "w" }
        );

        res.render("success");
      }
    } catch (e) {
      console.log(e);
      // res.redirect('/login')
    }
  });

/** try getting new access token if refresh token exists and it is valid*/
router.route("/token").get((req, res) => {
  if (!req.cookies["jwt-ref"]) {
    console.warn(
      "\x1b[33m%s\x1b[0m",
      "Could not find refresh token. Redirecting to /auth/login..."
    );
    return res.redirect("/auth/login");
  }
  try {
    const refreshToken = req.cookies["jwt-ref"];
    const refreshTokenPayload: any = jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET || "test123"
    );
    const [user, data] = getUser(refreshTokenPayload.email);

    if (!user || user.tokenVersion !== refreshTokenPayload.tokenVersion) {
      throw new Error(
        `DB user version: ${user?.tokenVersion} VS in req.cookie version: ${refreshTokenPayload.tokenVersion}`
      );
    } else {
      const updatedUser = { ...user, tokenVersion: user.tokenVersion + 1 };
      const jwtAccessToken = generateAccessToken(updatedUser);
      const jwtRefreshToken = generateRefreshToken(updatedUser);

      console.warn(
        "\x1b[32m%s\x1b[0m",
        `[+] Updating... Generating new access & refresh tokens for [${updatedUser.email}]:`
      );
      res.cookie("jwt-acc", jwtAccessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 10,
      });

      res.cookie("jwt-ref", jwtRefreshToken, {
        httpOnly: true,
        secure: false,
        // 7 days-cookie
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      // update the user in the db:
      // TODO: fix unoptimal map function
      const newData = [
        {
          users: data[0].users.map((item) => {
            if (item.email === updatedUser.email) return updatedUser;
            return item;
          }),
        },
      ];

      fs.writeFileSync(
        path.resolve(__dirname, "../../src/db/users.json"),
        JSON.stringify(newData),
        { encoding: "utf8", flag: "w" }
      );

      res.redirect("/");
    }
  } catch (error) {
    console.log("[x] Can't get new access token:", error);
  }
});

/** LOGOUT **/
router.route("/logout").get((req, res) => {
  res.clearCookie("jwt-ref");
  res.clearCookie("jwt-acc");
  res.redirect("/");
});

export { router as authRoutes };
