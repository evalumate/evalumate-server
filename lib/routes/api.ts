import * as express from "express";
import * as respond from "../utils/api-respond";
let router = express.Router();

/* GET API root */
router.get("/", function(req, res, next) {
  respond.success(res);
});

export default router;
