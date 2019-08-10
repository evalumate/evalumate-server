import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";
import { error as apiRespondError } from "../utils/api-respond";

export function frontendErrorHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
}

export function apiErrorHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  apiRespondError(res, err.status || 500, err.message, err.name);
}
