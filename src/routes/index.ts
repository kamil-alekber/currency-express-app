import express from "express";
import { apiRoutes } from "./apiRoutes";
import { indexRoutes } from "./indexRoutes";
import { authRoutes } from "./authRoutes";
import passport from "passport";
import { profileRoutes } from "./profileRoutes";
// import cors from "cors";

const router = express.Router();

router.use("/", indexRoutes);
router.use("/api", apiRoutes);
router.use("/auth", authRoutes);
// todo profile routes
router.use(
  "/profile",
  passport.authenticate("jwt", {
    session: false,
    failureRedirect: "/auth/token",
  }),
  profileRoutes
);
export { router as routes };
