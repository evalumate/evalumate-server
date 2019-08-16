import * as respond from "../utils/api-respond";
import asyncHandler from "express-async-handler";
import CaptchaController from "./captcha";
import config from "config";
import Controller from "../interfaces/controller";
import generatePassword from "password-generator";
import HttpStatus from "http-status-codes";
import IdHasher from "../utils/id-hasher";
import InvalidCaptchaSolutionException from "../exceptions/InvalidCaptchaSolutionException";
import Session from "../entities/session";
import validationMiddleware from "../middlewares/validation";
import { createLogger } from "../utils/logger";
import { CreateSessionDto } from "../dtos/session";
import { NextFunction, Request, Response, Router } from "express";

const logger = createLogger(module);
const sessionKeyLength: number = config.get("sessionKeyLength");
const idhasher = new IdHasher("session", config.get("ids.sessionIdLength"));

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
      this.mCreateSession
    );
  }

  public static async createSession(
    name: string,
    captchaRequired: boolean
  ): Promise<Session> {
    logger.info("Creating a new session");
    const session = new Session();
    session.key = generatePassword(sessionKeyLength);
    session.name = name;
    session.captchaRequired = captchaRequired;
    await session.save();

    return session;
  }

  private mCreateSession = asyncHandler(async (req: Request, res: Response) => {
    const requestData: CreateSessionDto = req.body;
    const captcha = requestData.captcha;

    // Validate captcha solution
    if (
      !(await CaptchaController.validateCaptchaSolution(
        captcha.token,
        captcha.solution
      ))
    ) {
      throw new InvalidCaptchaSolutionException();
    }

    const session = await SessionController.createSession(
      requestData.sessionName,
      requestData.captchaRequired
    );
    const publicId = idhasher.encode(session.id!);

    logger.info("Serving new session %s", session.id);
    respond.success(
      res,
      {
        session: {
          uri: `/api/sessions/${publicId}`,
          id: publicId,
          key: session.key,
        },
      },
      HttpStatus.CREATED
    );
  });
}

export default SessionController;
