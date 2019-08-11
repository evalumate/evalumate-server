import asyncHandler from "express-async-handler";
import * as respond from "../utils/api-respond";
import CaptchaController from "./captcha";
import config from "config";
import Controller from "../interfaces/controller";
import HttpStatus from "http-status-codes";
import InvalidCaptchaSolutionException from "../exceptions/InvalidCaptchaSolutionException";
import randomstring from "randomstring";
import Session from "../entities/session";
import validationMiddleware from "../middlewares/validation";
import { createLogger } from "../utils/logger";
import { CreateSessionDto } from "../dtos/session";
import { Request, Response, Router, NextFunction } from "express";

const logger = createLogger(module);

class SessionController implements Controller {
  public path = "/sessions";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      this.path,
      validationMiddleware(CreateSessionDto),
      this.createSession
    );
  }

  createSession = asyncHandler(async (req: Request, res: Response) => {
    const requestData: CreateSessionDto = req.body;

    // Validate captcha solution
    if (
      !(await CaptchaController.validateCaptchaSolution(
        requestData.captcha.token,
        requestData.captcha.solution
      ))
    ) {
      throw new InvalidCaptchaSolutionException();
    }

    logger.info("Creating new session");
    const session = new Session();
    session.publicId = randomstring.generate({ length: 10 }); // TODO use hashing from the id after saving
    // TODO generate cryptographically secure, user-friendly key
    session.name = requestData.sessionName;
    session.captchaRequired = requestData.captchaRequired;
    await session.save();

    // TODO specify uri format (domain-relative?)
    respond.success(
      res,
      {
        session: {
          uri: "TODO",
          sessionId: session.publicId,
          sessionKey: "TODO",
        },
      },
      HttpStatus.CREATED
    );
  });
}

export default SessionController;
