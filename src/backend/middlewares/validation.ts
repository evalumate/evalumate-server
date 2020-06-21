import { plainToClass } from "class-transformer";
import { ValidationError, validate } from "class-validator";
import * as express from "express";

import BadRequestException from "../exceptions/BadRequestException";

function validationMiddleware<T>(type: any, skipMissingProperties = false): express.RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.body), { skipMissingProperties }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          next(new BadRequestException(errors));
        } else {
          next();
        }
      }
    );
  };
}

export default validationMiddleware;
