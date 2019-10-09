import CaptchaController from "./CaptchaController";
import Controller from "./Controller";
import CreateSessionDto from "../dtos/CreateSessionDto";
import Session from "../entities/Session";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import InvalidSessionKeyException from "../exceptions/InvalidSessionKeyException";
import validationMiddleware from "../middlewares/validation";
import * as respond from "../utils/api-respond";
import { createLogger } from "../utils/logger";
import config from "config";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import HttpStatus from "http-status-codes";
import generatePassword from "password-generator";

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

  static async getSession(id: string) {
    const session = await Session.findOne(id);
    if (!session) throw new EntityNotFoundException("Session");
    return session;
  }

  /**
   * Tries to load a session with the public id from `req.params.sessionId` and responds with an
   * error on failure. On success, a `Session` object is made available via `req.session`.
   */
  static mLoadSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.session = await SessionController.getSession(req.params.sessionId);
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

  private mCreateSession = asyncHandler(async (req: Request, res: Response) => {
    const requestBody: CreateSessionDto = req.body;
    const captcha = requestBody.captcha;
    await CaptchaController.validateCaptchaSolution(captcha.token, captcha.solution);

    const session = await SessionController.createSession(
      requestBody.sessionName,
      requestBody.captchaRequired
    );

    logger.info("Serving new session %s", session.id);
    respond.success(
      res,
      {
        session: {
          uri: session.uri,
          id: session.id,
          name: session.name,
          key: session.key,
        },
      },
      HttpStatus.CREATED
    );
  });

  private mGetSession = async (req: Request, res: Response) => {
    const session = req.session!;
    respond.success(res, {
      sessionName: session.name,
      captchaRequired: session.captchaRequired,
    });
  };

  private mDeleteSession = asyncHandler(async (req: Request, res: Response) => {
    const session = req.session!;
    logger.info("Deleting session %s", session.id);
    await session.remove();
    respond.success(res);
  });

  private mGetSessionStatus = asyncHandler(async (req: Request, res: Response) => {
    const session = req.session!;
    respond.success(res, {}); // TODO add status data
  });
}

export default SessionController;
