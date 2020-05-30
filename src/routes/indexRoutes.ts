import request from "request-promise-native";
import express from "express";
import { runDataQuery } from "../helpers/getCurrencyData";
import jwt from "jsonwebtoken";

const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    if (req?.query?.refresh) await runDataQuery();

    const data = await request.get("http://localhost:5000/api/currency");
    const parsedData = JSON.parse(data);

    const isFresh =
      new Date(parsedData.date).toDateString() === new Date().toDateString();

    let user;
    try {
      user =
        req?.cookies?.["jwt-acc"] &&
        jwt.verify(req.cookies["jwt-acc"], process.env.TOKEN_SECRET as string);
    } catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "[x] Error Type:", error.name);
      console.error("\x1b[31m%s\x1b[0m", "[x] Error Msg:", error.message);
    }
    // send consent cookie
    if (!req?.cookies?.consent && req?.query?.consent) {
      res.cookie("consent", "true", {
        httpOnly: false,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
    }
    if (!req.cookies.locale) {
      res.cookie("locale", new Date().toLocaleDateString("ru"), {
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
    }
    res.render("index", {
      data: parsedData,
      isFresh,
      csrfToken: req.csrfToken(),
      user,
      consent: JSON.parse(req.cookies.consent || false),
    });
  })
  .post((req, res) => {
    const formData = Object.assign({}, req.body);
    console.log("[...] Data:", formData);
    res.redirect("/");
  });

export { router as indexRoutes };
