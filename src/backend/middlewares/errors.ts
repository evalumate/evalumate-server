import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";
import { error as apiRespondError } from "../utils/api-respond";

export function frontendErrorHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(err.status || 500).json(err);
}

export function apiErrorHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  apiRespondError(res, err);
}
