import { Router } from "express";
import fs from "fs";
import path from "path";
import { today } from "../helpers/getCurrencyData";

const router = Router();

router.route("/").get((req, res) => {
  const availableRoutes = router.stack.map((layer) => "api" + layer.route.path);
  res.json({ "list of available api routes": availableRoutes });
});

router.route("/currency").get(async (req, res) => {
  const data = await fs.promises.readFile(
    path.join(__dirname, `../../data/${today}.json`),
    { encoding: "utf-8" }
  );

  res.send(data);
});

export { router as apiRoutes };
