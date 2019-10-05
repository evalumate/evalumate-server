import { success as respondSuccess } from "../utils/api-respond";
import * as express from "express";
const router = express.Router();

/* GET API root */
router.get("/", function(req, res, next) {
  respondSuccess(res);
});

export default router;
