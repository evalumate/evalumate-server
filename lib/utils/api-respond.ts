import DetailHttpException from "../exceptions/DetailHttpException";
import HttpException from "../exceptions/HttpException";
import { Response } from "express";

const apiVersion = 0.1;

/**
 * Sends a success response according to the Google JSON Style Guide's Top-Level Reserved Property
 * Names.
 *
 * @param res The express Response object to send the response with
 * @param data An optional data object to send in the data property
 * @param status The HTTP status code (defaults to 200 OK)
 */
export function success(res: Response, data?: any, status?: number) {
  if (typeof status !== "undefined") {
    res.status(status);
  }
  if (typeof data === "undefined") {
    data = {};
  }
  res.send({
    apiVersion: apiVersion,
    data: data,
  });
}

/**
 * Sends an error response according to the Google JSON Style Guide's Top-Level Reserved Property
 * Names.
 *
 * @param res The express Response object to send the response with
 * @param error An instance of HttpError
 */
export function error(res: Response, error: HttpException) {
  const errorObject: any = {
    code: error.status,
    message: error.message,
    name: error.name,
  };
  if (error instanceof DetailHttpException && typeof error.details !== "undefined") {
    errorObject.details = error.details;
  }
  if (res.app.get("env") === "development") {
    errorObject.stack = error.stack;
  }

  res.status(error.status).send({
    apiVersion: apiVersion,
    error: errorObject,
  });
}
