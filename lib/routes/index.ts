import * as express from "express";
import apiRouter from "./api";
let router = express.Router();

/* GET home page */
router.get("/", function(req, res, next) {
  res.render("index", { title: "EvaluMate" });
});

/* Delegate GET /api to the api router */
router.use("/api", apiRouter);

export default router;
