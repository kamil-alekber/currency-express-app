import request from "request-promise-native";
import express from "express";

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

export { router as indexRoutes };
