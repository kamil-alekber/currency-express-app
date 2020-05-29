import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { getUser } from "../helpers/getUser";

const router = Router();

function generateAccessToken(username: { name: string }) {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("Should provide token secret in your ENV file");
  }

  // expires after 30 mins
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

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
        const token = generateAccessToken(user);
        console.warn("\x1b[32m%s\x1b[0m", "[+] generating token:", token);
        res.cookie("jwt", token, { httpOnly: true, secure: false });
        res.redirect("/api");
      });
    })(req, res);
  });

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
              { email: req.body.email, password: hashedPassword },
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
    }
  });

router.route("/logout").get((req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});
export { router as authRoutes };
