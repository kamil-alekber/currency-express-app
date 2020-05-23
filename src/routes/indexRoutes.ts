import request from "request-promise-native";
import express from "express";
import { runDataQuery, today } from "../helpers/getCurrencyData";

const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    console.log("req", req.query);
    if (req?.query?.refresh) {
      const res = await runDataQuery();
      console.log(res);
    }

    const data = await request.get("http://localhost:5000/api/currency");
    const parsedData = JSON.parse(data);

    const isFresh =
      new Date(parsedData.date).toDateString() === new Date().toDateString();

    res.render("index", { data: parsedData, isFresh });
  })
  .post((req, res) => {
    console.log(req.body.username);
    res.redirect("/");
  });

export { router as indexRoutes };
