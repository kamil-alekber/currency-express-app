import request from "request-promise-native";
import express from "express";
import { runDataQuery } from "../helpers/getCurrencyData";

const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    if (req?.query?.refresh) await runDataQuery();

    const data = await request.get("http://localhost:5000/api/currency");
    const parsedData = JSON.parse(data);

    const isFresh =
      new Date(parsedData.date).toDateString() === new Date().toDateString();

    res.render("index", {
      data: parsedData,
      isFresh,
      csrfToken: req.csrfToken(),
    });
  })
  .post((req, res) => {
    const formData = Object.assign({}, req.body);
    console.log("[...] Data:", formData);
    res.redirect("/");
  });

export { router as indexRoutes };
