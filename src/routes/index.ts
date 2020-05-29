import express from "express";
import { apiRoutes } from "./apiRoutes";
import { indexRoutes } from "./indexRoutes";
import { authRoutes } from "./authRoutes";
import passport from "passport";
import { profileRoutes } from "./profileRoutes";

const router = express.Router();

router.use("/", indexRoutes);
router.use("/api", apiRoutes);
router.use("/auth", authRoutes);
// todo profile routes
router.use(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  profileRoutes
);
export { router as routes };
