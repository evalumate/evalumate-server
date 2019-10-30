import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";
import { error as apiRespondError } from "../utils/api-respond";
import App from "../App";

export function frontendErrorHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.statusCode = err.status || 500;

  if (process.env.NODE_ENV == "production") {
    return App.nextJsServer.render(req, res, "/_error", { message: err.message });
  } else {
    return App.nextJsServer.renderError(err, req, res, "/_error");
  }
}

export function apiErrorHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  apiRespondError(res, err);
}
