import { Router } from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const router = Router();

router
  .route("/")
  .post((req, res, next) => {
    try {
      const client = req.cookies.client;
      const varified: any = jwt.verify(
        client,
        process.env.TOKEN_SECRET || "test123"
      );
      console.log(typeof varified.client);
      if (varified.client) {
        res.end("post request is restricted for public usage");
      } else {
        console.warn(
          "\x1b[33m%s\x1b[0m",
          "[^] Admin. Using the following body",
          req.body
        );
        const responseText = "FORM is ok. Data has been processed";
        console.log("\x1b[32m%s\x1b[0m", "[+] Responce Text", responseText);
        res.send(responseText);
      }
    } catch (e) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "[x] Invalid client token. Reason:",
        e
      );
      res.end("post request is restricted for public usage");
    }
  })
  .delete((req, res) => {
    res.json("delete route");
  })
  .get((req, res) => {
    const availableRoutes = router.stack.map(
      (layer) => "api" + layer.route.path
    );

    if (!req.cookies.client) {
      const clientToken = jwt.sign(
        // TODO: deside if admin or client from the jwt-acc token
        { client: false },
        process.env.TOKEN_SECRET || "test123"
      );
      res.cookie("client", clientToken, { domain: "localhost" });
    }
    res.json({
      "list of available api routes": availableRoutes,
      _csrf: req.csrfToken(),
    });
  })
  .post((req, res) => {
    console.warn("req body at api route", req.body);
    res.redirect("/api");
  });

router.route("/currency").get(async (req, res) => {
  const availableDays = fs.readdirSync(path.resolve(__dirname, "../../data"));

  const todayFile =
    new Date().toLocaleDateString().replace(/\//g, "-") + ".json";

  const todayFileIndex = availableDays.indexOf(todayFile);

  const data = await fs.promises.readFile(
    path.join(
      __dirname,
      `../../data/${
        todayFileIndex > -1
          ? availableDays[todayFileIndex]
          : availableDays.pop()
      }`
    ),
    { encoding: "utf-8" }
  );

  res.send(data);
});

export { router as apiRoutes };
