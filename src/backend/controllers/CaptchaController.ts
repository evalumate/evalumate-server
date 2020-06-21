import config from "config";
import { Request, Response } from "express";
import svgCaptcha from "svg-captcha";

import Captcha from "../entities/Captcha";
import InvalidCaptchaSolutionException from "../exceptions/InvalidCaptchaSolutionException";
import InvalidCaptchaTokenException from "../exceptions/InvalidCaptchaTokenException";
import * as respond from "../utils/api-respond";
import { createLogger } from "../utils/logger";
import Controller from "./Controller";

const logger = createLogger(module);

export const captchaTtl: number = config.get("captcha.ttl");
const deleteExpiredInterval: number = config.get("captcha.deleteExpiredInterval");

class CaptchaController extends Controller {
  private deleteExpiredIntervalId: number;

  constructor() {
    super("/captcha");
    this.initializeRoutes();
    this.deleteExpiredIntervalId = setInterval(
      Captcha.deleteExpired,
      deleteExpiredInterval * 1000,
      captchaTtl
    );
  }

  initializeRoutes() {
    this.router.get(this.path, this.mGetNewCaptcha);
  }

  static async createCaptcha(): Promise<Captcha> {
    logger.debug("Generating new captcha");
    const generatedCaptcha = svgCaptcha.create();

    const captcha = new Captcha();
    captcha.image = generatedCaptcha.data;
    captcha.solution = generatedCaptcha.text;

    await captcha.save();
    return captcha;
  }

  private mGetNewCaptcha = async (req: Request, res: Response) => {
    const captcha = await CaptchaController.createCaptcha();

    logger.debug("Serving captcha with token %s", captcha.id);
    respond.success(res, {
      captcha: {
        image: captcha.image,
        token: captcha.id,
      },
    });
  };

  /**
   * Given a captcha id and a solution, rejects the returned promise with an appropriate exception
   * if the id or the solution is invalid.
   *
   * @param id The captcha's id
   * @param solution The solution to be validated
   *
   * @throws InvalidCaptchaTokenException if no captcha with the given id and younger than
   * `captchas.ttl` (config option) seconds exists.
   * @throws InvalidCaptchaSolutionException if the provided solution is incorrect.
   */
  static async validateCaptchaSolution(id: string, solution: string) {
    logger.debug("Validating captcha solution with token %s", id);
    const captcha = await Captcha.findAliveById(id, captchaTtl);
    if (!captcha) {
      throw new InvalidCaptchaTokenException();
    }
    if (solution !== captcha.solution) {
      throw new InvalidCaptchaSolutionException();
    }
    await captcha.remove();
  }

  async shutDown() {
    clearInterval(this.deleteExpiredIntervalId);
    logger.debug("deleteExpired interval was cleared");
  }
}

export default CaptchaController;
