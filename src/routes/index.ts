import express from "express";
import { apiRoutes } from "./apiRoutes";
import { indexRoutes } from "./indexRoutes";

const router = express.Router();

router.use("/", indexRoutes);
router.use("/api", apiRoutes);

export { router as routes };
