import express from "express";
import path from "path";
import fs from "fs";
import request from "request-promise-native";

const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    const data = await request.get("http://localhost:5000/api/currency");

    res.render("index", { data: JSON.parse(data) });
  })
  .post((req, res) => {
    console.log(req.body.username);
    res.redirect("/");
  });

router.route("/api/currency").get(async (req, res) => {
  const data = await fs.promises.readFile(
    path.join(__dirname, "../../data/5-22-2020.json"),
    { encoding: "utf-8" }
  );

  res.send(data);
});
export default router;
