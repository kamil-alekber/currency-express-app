import express from "express";

const router = express.Router();

router.route("/").get((req, res) => {
  console.log("[+] Cookies", req.cookies);
  res.json("profile page for you");
});

export { router as profileRoutes };
