import * as respond from "../utils/api-respond";
import asyncHandler from "express-async-handler";
import CaptchaController from "./CaptchaController";
import config from "config";
import Controller from "./Controller";
import CreateSessionDto from "../dtos/CreateSessionDto";
import generatePassword from "password-generator";
import HttpException from "../exceptions/HttpException";
import HttpStatus from "http-status-codes";
import Session from "../entities/Session";
import validationMiddleware from "../middlewares/validation";
import { createLogger } from "../utils/logger";
import { NextFunction, Request, Response } from "express";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import InvalidSessionKeyException from "../exceptions/InvalidSessionKeyException";

const logger = createLogger(module);
const sessionKeyLength: number = config.get("sessionKeyLength");

class SessionController extends Controller {
  constructor() {
    super("/sessions");
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(this.path, validationMiddleware(CreateSessionDto), this.mCreateSession);
    this.router.get(this.path + "/:sessionId", SessionController.mLoadSession, this.mGetSession);
    this.router.delete(
      this.path + "/:sessionId",
      SessionController.mLoadSession,
      SessionController.mValidateSessionKey,
      this.mDeleteSession
    );
    this.router.get(
      this.path + "/:sessionId/status",
      SessionController.mLoadSession,
      SessionController.mValidateSessionKey,
      this.mGetSessionStatus
    );
  }

  static async createSession(name: string, captchaRequired: boolean): Promise<Session> {
    logger.info("Creating a new session");
    const session = new Session();
    session.key = generatePassword(sessionKeyLength);
    session.name = name;
    session.captchaRequired = captchaRequired;

    await session.save();
    return session;
  }

  static async getSessionByPublicId(publicId: string) {
    const session = await Session.findOneByPublicId(publicId);
    if (!session) throw new EntityNotFoundException("Session");
    return session;
  }

  private mCreateSession = asyncHandler(async (req: Request, res: Response) => {
    const requestBody: CreateSessionDto = req.body;
    const captcha = requestBody.captcha;
    await CaptchaController.validateCaptchaSolution(captcha.token, captcha.solution);

    const session = await SessionController.createSession(
      requestBody.sessionName,
      requestBody.captchaRequired
    );

    logger.info("Serving new session %s", session.publicId);
    respond.success(
      res,
      {
        session: {
          uri: session.uri,
          id: session.publicId,
          key: session.key,
        },
      },
      HttpStatus.CREATED
    );
  });

  /**
   * Tries to load a session with the public id from `req.params.sessionId` and responds with an
   * error on failure. On success, a `Session` object is made available via `req.session`.
   */
  static mLoadSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.session = await SessionController.getSessionByPublicId(req.params.sessionId);
    next();
  });

  /**
   * Validates `req.query.sessionKey` against `req.session.key` and responds with an
   * `InvalidSessionKeyException` if `req.query.sessionKey` is not set or does not match
   * `req.session.key`.
   *
   * @requires SessionController.mLoadSession to be chained before this middleware.
   */
  static mValidateSessionKey = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const session = req.session!;
      if (typeof req.query.sessionKey === "undefined" || req.query.sessionKey !== session.key) {
        throw new InvalidSessionKeyException();
      }
      next();
    }
  );

  private mGetSession = async (req: Request, res: Response) => {
    const session = req.session!;
    respond.success(res, {
      sessionName: session.name,
      captchaRequired: session.captchaRequired,
    });
  };

  private mDeleteSession = async (req: Request, res: Response) => {
    await req.session!.remove();
    respond.success(res);
  };

  private mGetSessionStatus = async (req: Request, res: Response) => {
    const session = req.session!;
    respond.success(res, {}); // TODO add status data
  };
}

export default SessionController;
