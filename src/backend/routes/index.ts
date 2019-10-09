import apiRouter from "./api";
import * as express from "express";
import HttpException from "../exceptions/HttpException";
const router = express.Router();

// Frontend routes are handled by Next.js

/* Delegate GET /api to the api router */
router.use("/api", apiRouter);

export default router;
