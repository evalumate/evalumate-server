import * as respond from "../utils/api-respond";
import asyncHandler from "express-async-handler";
import CaptchaController from "./CaptchaController";
import config from "config";
import Controller from "./Controller";
import generatePassword from "password-generator";
import HttpStatus from "http-status-codes";
import IdHasher from "../utils/IdHasher";
import InvalidCaptchaSolutionException from "../exceptions/InvalidCaptchaSolutionException";
import Session from "../entities/Session";
import validationMiddleware from "../middlewares/validation";
import { createLogger } from "../utils/logger";
import { CreateSessionDto } from "../dtos/session";
import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";

const logger = createLogger(module);
const sessionKeyLength: number = config.get("sessionKeyLength");
const idhasher = new IdHasher("session", config.get("ids.sessionIdLength"));

class SessionController extends Controller {
  constructor() {
    super("/sessions");
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(this.path, validationMiddleware(CreateSessionDto), this.mCreateSession);
    this.router.get(this.path + "/:sessionId", this.mGetSession);
    this.router.delete(this.path + "/:sessionId", this.mDeleteSession);
    this.router.get(this.path + "/:sessionId/status", this.mGetSessionStatus);
  }

  static async createSession(name: string, captchaRequired: boolean): Promise<Session> {
    logger.info("Creating a new session");
    const session = new Session();
    session.key = generatePassword(sessionKeyLength);
    session.name = name;
    session.captchaRequired = captchaRequired;

    await session.save();
    session.publicId = idhasher.encode(session.id!);
    return session;
  }

  static async getSessionByPublicId(publicId: string) {
    const sessionId = idhasher.decodeSingle(publicId);
    const session = await Session.findOne({ id: sessionId });
    if (!session) {
      throw new HttpException(404, "A session with the requested id does not exist.");
    }
    return session;
  }

  private mCreateSession = asyncHandler(async (req: Request, res: Response) => {
    const requestData: CreateSessionDto = req.body;
    const captcha = requestData.captcha;

    // Validate captcha solution
    if (!(await CaptchaController.validateCaptchaSolution(captcha.token, captcha.solution))) {
      throw new InvalidCaptchaSolutionException();
    }

    const session = await SessionController.createSession(
      requestData.sessionName,
      requestData.captchaRequired
    );

    logger.info("Serving new session %s", session.id);
    respond.success(
      res,
      {
        session: {
          uri: session.getUri(),
          id: session.publicId,
          key: session.key,
        },
      },
      HttpStatus.CREATED
    );
  });

  private mGetSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await SessionController.getSessionByPublicId(req.params.sessionId);

    respond.success(res, {
      sessionName: session.name,
      captchaRequired: session.captchaRequired,
    });
  });

  private mDeleteSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await SessionController.getSessionByPublicId(req.params.sessionId);

    if (req.query.sessionKey !== session.key) {
      throw new HttpException(403, "The received session key is invalid");
    }

    await session.remove();
    respond.success(res);
  });

  private mGetSessionStatus = asyncHandler(async (req: Request, res: Response) => {
    const session = await SessionController.getSessionByPublicId(req.params.sessionId);

    if (req.query.sessionKey !== session.key) {
      throw new HttpException(403, "The received session key is invalid");
    }

    respond.success(res, {});
  });
}

export default SessionController;
