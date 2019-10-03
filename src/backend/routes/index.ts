import apiRouter from "./api";
import { sendIndexHtml } from "../middlewares/static";
import * as express from "express";
let router = express.Router();

/* Frontend routes (handled by index.html) */
router.get("/", sendIndexHtml);
router.get("/about", sendIndexHtml);
router.get("/client", sendIndexHtml);
router.get("/master", sendIndexHtml);
router.get("/client/:sessionId", sendIndexHtml);
router.get("/master/:sessionId", sendIndexHtml);

/* Delegate GET /api to the api router */
router.use("/api", apiRouter);

export default router;
