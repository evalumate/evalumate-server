import config from "config";
import cryptoRandomString from "crypto-random-string";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import HttpStatus from "http-status-codes";
import pick from "lodash/pick";

import CreateMemberDto from "../dtos/CreateMemberDto";
import SetUnderstandingDto from "../dtos/SetUnderstandingDto";
import Member from "../entities/Member";
import Session from "../entities/Session";
import CaptchaRequiredException from "../exceptions/CaptchaRequiredException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import InvalidMemberSecretException from "../exceptions/InvalidMemberSecretException";
import validationMiddleware from "../middlewares/validation";
import * as respond from "../utils/api-respond";
import { createLogger } from "../utils/logger";
import { getUnixTimestamp } from "../utils/time";
import CaptchaController from "./CaptchaController";
import Controller from "./Controller";
import SessionController from "./SessionController";

const logger = createLogger(module);

const memberSecretLength: number = config.get("member.secretLength");

export default class MemberController extends Controller {
  constructor() {
    super("/sessions/:sessionId/members");
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      this.path,
      SessionController.mLoadSession,
      validationMiddleware(CreateMemberDto),
      this.mCreateMember
    );
    this.router.delete(
      this.path + "/:memberId",
      MemberController.mLoadMember,
      MemberController.mValidateMemberSecret,
      this.mDeleteMember
    );
    this.router.put(
      this.path + "/:memberId/status",
      MemberController.mLoadMember,
      MemberController.mValidateMemberSecret,
      validationMiddleware(SetUnderstandingDto),
      this.mSetUnderstanding
    );
  }

  static async createMember(session: Session): Promise<Member> {
    logger.info("Registering a new member in session %s", session.id);
    const member = new Member();
    member.session = session;
    member.secret = cryptoRandomString({ length: memberSecretLength });
    await member.save();
    return member;
  }

  static async getMember(id: string, sessionId: string) {
    const member = await Member.findOne({ id, sessionId });
    if (!member) throw new EntityNotFoundException("Member");
    return member;
  }

  /**
   * Tries to load a member with the public id from `req.params.memberId` and the session id from
   * `req.params.sessionId` and responds with an error on failure. On success, a `Member` object is
   * made available via `req.member`.
   *
   * Note: The member's session object property is not loaded for performance reasons.
   */
  static mLoadMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    req.member = await MemberController.getMember(req.params.memberId, req.params.sessionId);
    next();
  });

  /**
   * Validates `req.query.memberSecret` against `req.member.secret` and responds with an
   * `InvalidMemberSecretException` if `req.query.memberSecret` is not set or does not match
   * `req.member.secret`.
   *
   * @requires MemberController.mLoadMember to be chained before this middleware.
   */
  static mValidateMemberSecret = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const member = req.member!;
      if (
        typeof req.query.memberSecret === "undefined" ||
        req.query.memberSecret !== member.secret
      ) {
        throw new InvalidMemberSecretException();
      }
      next();
    }
  );

  private mCreateMember = asyncHandler(async (req: Request, res: Response) => {
    const session = req.session!;

    if (session.captchaRequired) {
      const captcha = (req.body as CreateMemberDto).captcha;
      if (!captcha) {
        throw new CaptchaRequiredException();
      }
      // Validate captcha solution
      await CaptchaController.validateCaptchaSolution(captcha.token, captcha.solution);
    }

    const member = await MemberController.createMember(session);

    logger.debug("Serving new member %s", member.id);
    respond.success(
      res,
      {
        member: pick(member, ["uri", "id", "secret"]),
      },
      HttpStatus.CREATED
    );
  });

  private mDeleteMember = asyncHandler(async (req: Request, res: Response) => {
    await req.member!.remove();
    respond.success(res);
  });

  private mSetUnderstanding = asyncHandler(async (req: Request, res: Response) => {
    const member = req.member!;
    member.understanding = (req.body as SetUnderstandingDto).understanding;
    member.lastPingTime = getUnixTimestamp();
    await member.save();
    respond.success(res);
  });
}
