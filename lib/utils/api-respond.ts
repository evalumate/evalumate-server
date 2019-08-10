import { Response } from "express";

const apiVersion = 0.1;

/**
 * Sends a success response according to the Google JSON Style Guide's Top-Level
 * Reserved Property Names.
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
 * Sends an error response according to the Google JSON Style Guide's Top-Level
 * Reserved Property Names.
 *
 * @param res The express Response object to send the response with
 * @param status The HTTP status code
 * @param message An optional error message
 * @param name The name of an exception (if any)
 */
export function error(
  res: Response,
  status: number,
  message?: string,
  name?: string
) {
  const errorObject: any = {
    code: status,
  };
  if (typeof message !== "undefined") {
    errorObject.message = message;
  }
  if (typeof name !== "undefined") {
    errorObject.name = name;
  }

  res.status(status).send({
    apiVersion: apiVersion,
    error: errorObject,
  });
}
