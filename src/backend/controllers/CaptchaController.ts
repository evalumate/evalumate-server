import * as respond from "../utils/api-respond";
import Captcha from "../entities/Captcha";
import config from "config";
import Controller from "./Controller";
import InvalidCaptchaSolutionException from "../exceptions/InvalidCaptchaSolutionException";
import InvalidCaptchaTokenException from "../exceptions/InvalidCaptchaTokenException";
import randomstring from "randomstring";
import svgCaptcha from "svg-captcha";
import { clearInterval, setInterval } from "timers";
import { createLogger } from "../utils/logger";
import { Request, Response } from "express";

const logger = createLogger(module);

const captchaTtl: number = config.get("captcha.ttl");

class CaptchaController extends Controller {
  private deleteExpiredTimeout: NodeJS.Timeout;

  constructor() {
    super("/captcha");
    this.initializeRoutes();
    let deleteExpiredInterval: number = config.get("captcha.deleteExpiredInterval");
    this.deleteExpiredTimeout = setInterval(
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
   * Given a captcha id and a solution, throws an appropriate exception if the id or the solution is
   * invalid.
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
    clearInterval(this.deleteExpiredTimeout);
  }
}

export default CaptchaController;
