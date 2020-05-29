import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

function generateAccessToken(username: { name: string }) {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("Should provide token secret in your ENV file");
  }

  // expires after 30 mins
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

router.route("/login").post((req, res) => {
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

export { router as authRoutes };
