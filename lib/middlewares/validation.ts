import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import * as express from "express";
import BadRequestException from "../exceptions/BadRequestException";

function validationMiddleware<T>(
  type: any,
  skipMissingProperties = false
): express.RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.body), { skipMissingProperties }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          next(new BadRequestException()); // TODO add error array to the exception class (or the error array)
        } else {
          next();
        }
      }
    );
  };
}

export default validationMiddleware;
